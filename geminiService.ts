import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Verdict, FactCheckResult, AppLanguage, GroundingLink } from './types.ts';
import { saveToCache, getFromCache } from './utils.ts';

// Singleton AudioContext to be initialized/resumed on user gesture
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
 * Enhanced Error Handler for API issues
 */
const handleApiError = (error: any) => {
  const msg = error?.message || String(error);
  console.error("Gemini API Error Details:", error);
  
  if (msg.toLowerCase().includes("permission denied") || 
      msg.toLowerCase().includes("not found") ||
      msg.toLowerCase().includes("api_key_invalid")) {
    return "PERMISSION_ERROR";
  }
  return msg;
};

export async function factCheckClaim(claim: string, imageBase64?: string, language: AppLanguage = 'ENG'): Promise<FactCheckResult & { groundingLinks?: GroundingLink[] }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    You are a professional fact-checker for Kenyan citizens, acting as a trusted advisor for seniors.
    Fact-check the following claim or image content: "${claim}"
    Language to respond in: ${language}.
    
    Ground your verification in the Constitution of Kenya and the Elections Act.
    Respond in JSON format with:
    - verdict: "TRUE", "FALSE", or "CAUTION"
    - summary: A very short (1 sentence) verdict.
    - explanation: A simple explanation suitable for a senior citizen.
    - sources: A list of citations or names of sources used.
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

    // Extract Grounding Links
    const groundingLinks: GroundingLink[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          groundingLinks.push({ uri: chunk.web.uri, title: chunk.web.title || "Official Source" });
        }
      });
    }

    const result = JSON.parse(response.text || '{}') as FactCheckResult;
    return { ...result, groundingLinks };
  } catch (e) {
    const errorType = handleApiError(e);
    if (errorType === "PERMISSION_ERROR") {
      return {
        verdict: Verdict.CAUTION,
        summary: "API Access Required",
        explanation: "This feature requires a paid Gemini API key with Google Search access. Please ensure your Vercel API_KEY is from a billing-enabled project.",
        sources: ["Check settings or billing status."],
        groundingLinks: [{ uri: "https://ai.google.dev/gemini-api/docs/billing", title: "IEBC / Google Billing Docs" }]
      };
    }
    throw e;
  }
}

export async function getLiveNewsSummary(language: AppLanguage): Promise<string> {
  const cacheKey = `news_${language}`;
  if (!navigator.onLine) {
    const cached = await getFromCache(cacheKey);
    return cached || "You are offline. Please check your connection.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Provide a 2-sentence non-partisan factual update on Kenyan election news for a senior citizen in ${language}.`,
      config: { tools: [{ googleSearch: {} }] }
    });
    const result = response.text || "No news found at this moment.";
    await saveToCache(cacheKey, result);
    return result;
  } catch (err) {
    const errorType = handleApiError(err);
    if (errorType === "PERMISSION_ERROR") return "News unavailable: API Key lacks Search access.";
    const cached = await getFromCache(cacheKey);
    return cached || "News feed currently updating...";
  }
}

export async function generateTopicImage(topic: string): Promise<string> {
  const cacheKey = `img_${topic.substring(0, 50).replace(/\s/g, '_')}`;
  const cachedImage = await getFromCache(cacheKey);
  if (cachedImage) return cachedImage;

  if (!navigator.onLine) return `https://picsum.photos/seed/${topic}/800/450`;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `Dignified image of: ${topic}. Focus on authentic Kenyan citizens, professional lighting, clean background.` }] },
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
    console.error("Image generation failed:", e);
  }
  return `https://picsum.photos/seed/${topic}/800/450`;
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
    console.error("TTS generation failed:", e);
    return null;
  }
}

export async function speakText(text: string, voice: string = 'Kore'): Promise<void> {
  const ctx = getAudioCtx(); // Resumes on click
  const audioBuffer = await fetchTTSBuffer(text, voice);
  if (!audioBuffer) return;

  return new Promise((resolve) => {
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.onended = () => resolve();
    source.start();
  });
}

export async function chatAssistant(message: string, language: AppLanguage, history: {role: string, text: string}[] = []): Promise<{text: string, links: GroundingLink[]}> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `You are SautiSahihi Civic Guide for Kenyan seniors. Respond in ${language}. Be patient and respectful.`;
  
  const contents = history.map(h => ({
    role: h.role === 'ai' ? 'model' : 'user',
    parts: [{ text: h.text }]
  }));
  contents.push({ role: 'user', parts: [{ text: message }] });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: contents,
      config: { systemInstruction, tools: [{ googleSearch: {} }] }
    });

    const links: GroundingLink[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri) links.push({ uri: chunk.web.uri, title: chunk.web.title || "Reference" });
      });
    }

    return { text: response.text || "I couldn't find an answer. Please try again.", links };
  } catch (e) {
    const errorType = handleApiError(e);
    if (errorType === "PERMISSION_ERROR") return { text: "I need search permissions to answer this. Update your key in Settings.", links: [] };
    return { text: "Pole, I am having trouble connecting right now.", links: [] };
  }
}