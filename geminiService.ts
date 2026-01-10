import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Verdict, FactCheckResult, AppLanguage, GroundingLink } from './types.ts';
import { saveToCache, getFromCache } from './utils.ts';

// Singleton AudioContext - Must be resumed on user gesture
let _audioCtx: AudioContext | null = null;

export const getAudioCtx = () => {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  if (_audioCtx.state === 'suspended') {
    _audioCtx.resume();
  }
  return _audioCtx;
};

/**
 * Handles common API errors like billing/permission issues
 */
const handleApiError = (error: any): string => {
  const msg = error?.message || String(error);
  console.error("SautiSahihi API Error:", msg);
  if (msg.toLowerCase().includes("permission denied") || msg.toLowerCase().includes("not found")) {
    return "CREDENTIALS_ERROR";
  }
  return "GENERAL_ERROR";
};

export async function factCheckClaim(claim: string, imageBase64?: string, language: AppLanguage = 'ENG'): Promise<FactCheckResult & { groundingLinks?: GroundingLink[] }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    You are a professional fact-checker for Kenyan citizens.
    Fact-check the following claim or image content: "${claim}"
    Respond in ${language}.
    Ground your verification in the Constitution of Kenya and the Elections Act.
    Respond ONLY in JSON format with these keys: verdict (TRUE/FALSE/CAUTION), summary, explanation, sources (array).
  `;

  const contents: any = { parts: [{ text: prompt }] };
  if (imageBase64) {
    contents.parts.push({
      inlineData: {
        data: imageBase64.split(',')[1],
        mimeType: 'image/png'
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: contents,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING },
            summary: { type: Type.STRING },
            explanation: { type: Type.STRING },
            sources: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["verdict", "summary", "explanation", "sources"]
        }
      }
    });

    const groundingLinks: GroundingLink[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri) groundingLinks.push({ uri: chunk.web.uri, title: chunk.web.title || "Reference" });
      });
    }

    const result = JSON.parse(response.text || '{}') as FactCheckResult;
    return { ...result, groundingLinks };
  } catch (e) {
    const errType = handleApiError(e);
    if (errType === "CREDENTIALS_ERROR") {
      return {
        verdict: Verdict.CAUTION,
        summary: "Permission Required",
        explanation: "This feature (Google Search) requires a Gemini API key from a project with billing enabled. Please check your Vercel/AI Studio environment variables.",
        sources: ["API Connection Issue"],
        groundingLinks: [{ uri: "https://ai.google.dev/gemini-api/docs/billing", title: "Billing Guide" }]
      };
    }
    throw e;
  }
}

export async function getLiveNewsSummary(language: AppLanguage): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Provide a 2-sentence factual update on Kenyan election news for a senior in ${language}.`,
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "No news found.";
  } catch (err) {
    handleApiError(err);
    return "Official sources are currently being updated. Please check back in a few minutes.";
  }
}

export async function generateTopicImage(topic: string): Promise<string> {
  const cacheKey = `img_${topic.substring(0, 30).replace(/\s/g, '_')}`;
  const cached = await getFromCache(cacheKey);
  if (cached) return cached;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `A high-resolution, dignified photo of ${topic} in a Kenyan village setting. Professional lighting, photorealistic.` }] },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64 = `data:image/png;base64,${part.inlineData.data}`;
        await saveToCache(cacheKey, base64);
        return base64;
      }
    }
  } catch (e) {
    console.warn("AI Image generation failed, falling back to placeholder.");
  }
  return `https://picsum.photos/seed/${encodeURIComponent(topic)}/800/450`;
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export async function fetchTTSBuffer(text: string, voice: string = 'Kore'): Promise<AudioBuffer | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;
    return await decodeAudioData(decode(base64Audio), getAudioCtx(), 24000, 1);
  } catch (e) {
    console.error("Voice synthesis failed:", e);
    return null;
  }
}

export async function speakText(text: string): Promise<void> {
  const ctx = getAudioCtx(); 
  const audioBuffer = await fetchTTSBuffer(text);
  if (!audioBuffer) return;

  return new Promise((resolve) => {
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.onended = () => resolve();
    source.start();
  });
}

export async function chatAssistant(message: string, language: AppLanguage, history: any[] = []): Promise<{text: string, links: GroundingLink[]}> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `You are SautiSahihi Civic Guide for Kenyan seniors. Respond in ${language}. Use Google Search.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [...history, { role: 'user', parts: [{ text: message }] }],
      config: { systemInstruction, tools: [{ googleSearch: {} }] }
    });

    const links: GroundingLink[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri) links.push({ uri: chunk.web.uri, title: chunk.web.title || "Reference" });
      });
    }

    return { text: response.text || "I am processing your request...", links };
  } catch (e) {
    const errType = handleApiError(e);
    if (errType === "CREDENTIALS_ERROR") return { text: "I need search permissions to answer this accurately. Please check your project billing status.", links: [] };
    return { text: "Pole, I am currently having trouble connecting. Please try again in a few moments.", links: [] };
  }
}