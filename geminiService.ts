
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Verdict, FactCheckResult, AppLanguage } from './types.ts';
import { saveToCache, getFromCache } from './utils.ts';

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Singleton AudioContext to prevent lag and context overhead
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
  if (msg.toLowerCase().includes("permission denied") || msg.toLowerCase().includes("requested entity was not found")) {
    return "PERMISSION_ERROR";
  }
  return msg;
};

export async function factCheckClaim(claim: string, imageBase64?: string, language: AppLanguage = 'ENG'): Promise<FactCheckResult> {
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
    - sources: A list of verified URLs or legal citations (e.g., Article X of Constitution).
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

    const text = response.text || '{}';
    return JSON.parse(text) as FactCheckResult;
  } catch (e) {
    const errorType = handleApiError(e);
    if (errorType === "PERMISSION_ERROR") {
      return {
        verdict: Verdict.CAUTION,
        summary: "API Key Permission Error",
        explanation: "Your current API key does not have access to Google Search or Gemini 3 models. Please refresh your API key in settings and ensure it is from a paid Google Cloud project.",
        sources: ["https://ai.google.dev/gemini-api/docs/billing"]
      };
    }
    return {
      verdict: Verdict.CAUTION,
      summary: "Verification failed.",
      explanation: "We couldn't reach our fact-checking engine. Please try again later.",
      sources: []
    };
  }
}

export async function getLiveNewsSummary(language: AppLanguage): Promise<string> {
  const cacheKey = `news_${language}`;
  if (!navigator.onLine) {
    const cached = await getFromCache(cacheKey);
    return cached || "You are offline.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Summarize the top 3 latest Kenyan political news stories for a senior citizen in ${language}. Keep it strictly factual.`,
      config: { tools: [{ googleSearch: {} }] }
    });
    const result = response.text || "No news found.";
    await saveToCache(cacheKey, result);
    return result;
  } catch (err) {
    const errorType = handleApiError(err);
    if (errorType === "PERMISSION_ERROR") {
      return "ERROR: Permission Denied. Your API key lacks Google Search permissions. Please update your key in Settings.";
    }
    const cached = await getFromCache(cacheKey);
    return cached || "News currently unavailable.";
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
      contents: { parts: [{ text: `Dignified image of: ${topic}. Focus on Kenyan citizens, authentic tones, professional lighting.` }] },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64 = `data:image/png;base64,${part.inlineData.data}`;
        await saveToCache(cacheKey, base64);
        return base64;
      }
    }
  } catch (e) {}
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
    return null;
  }
}

export async function speakText(text: string, voice: string = 'Kore'): Promise<void> {
  const audioBuffer = await fetchTTSBuffer(text, voice);
  if (!audioBuffer) return;

  const ctx = getAudioCtx();
  return new Promise((resolve) => {
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.onended = () => resolve();
    source.start();
  });
}

export async function chatAssistant(message: string, language: AppLanguage, history: {role: string, text: string}[] = []): Promise<string> {
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
    return response.text || "Error processing request.";
  } catch (e) {
    const errorType = handleApiError(e);
    if (errorType === "PERMISSION_ERROR") return "ERROR: Permission Denied. Your API key lacks advanced permissions. Update your key in Settings.";
    return "Pole, connection error. Please try again.";
  }
}
