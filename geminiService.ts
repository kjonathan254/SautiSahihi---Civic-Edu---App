import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Verdict, FactCheckResult, AppLanguage, GroundingLink } from './types.ts';
import { saveToCache, getFromCache } from './utils.ts';

// Singleton AudioContext
let _audioCtx: AudioContext | null = null;
export const getAudioCtx = () => {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  if (_audioCtx.state === 'suspended') { _audioCtx.resume(); }
  return _audioCtx;
};

/**
 * SMART CONTEXT-AWARE IMAGE ORCHESTRATOR
 * Sequence: Cache -> Gemini -> Static Fallback
 */
export async function generateTopicImage(prompt: string, topicId: string, context?: string, fallbackUrl?: string): Promise<string> {
  const cacheKey = `img_v5_${topicId}`;
  
  // 1. Check Cache
  const cached = await getFromCache(cacheKey);
  if (cached) return cached;

  // 2. Refine Prompt
  let refinedPrompt = prompt;
  try {
    const aiRefiner = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
    const refinement = await aiRefiner.models.generateContent({
      model: 'gemini-2.5-flash-lite-latest',
      contents: [{ role: 'user', parts: [{ text: `Create a 1-sentence cinematic photo prompt for: "${prompt}". Focus on: Kenyan citizens, realistic lighting, Nairobi atmosphere, high dignity. Context: ${context || 'Kenyan civic life'}. Style: Photorealistic 8k.` }] }]
    });
    if (refinement.text) refinedPrompt = refinement.text;
  } catch (e) {
    refinedPrompt = `${prompt}, photorealistic, Kenyan context, high quality`;
  }

  // 3. Try Gemini Image Generation
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: [{ role: 'user', parts: [{ text: refinedPrompt }] }],
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    const imgPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (imgPart?.inlineData) {
      const b64 = `data:image/png;base64,${imgPart.inlineData.data}`;
      await saveToCache(cacheKey, b64);
      return b64;
    }
  } catch (e) {
    console.warn("Gemini Image generation skipped or failed.");
  }
  
  // 4. Final Fallback
  return fallbackUrl || `https://picsum.photos/seed/${topicId}/800/450`;
}

export async function fastAIResponse(prompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite-latest',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    return response.text || "No response.";
  } catch (e) {
    return "Error getting fast response.";
  }
}

export async function factCheckClaim(claim: string, imageBase64?: string, language: AppLanguage = 'ENG'): Promise<FactCheckResult & { groundingLinks?: GroundingLink[] }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const prompt = `Fact-check this claim for a Kenyan audience: "${claim}". Respond in ${language}. Use JSON format.`;
  const contents: any[] = [{ role: 'user', parts: [{ text: prompt }] }];
  if (imageBase64) {
    contents[0].parts.push({ inlineData: { data: imageBase64.split(',')[1], mimeType: 'image/png' } });
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview', 
      contents,
      config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
    });
    const groundingLinks: GroundingLink[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => { if (chunk.web?.uri) groundingLinks.push({ uri: chunk.web.uri, title: chunk.web.title || "Source" }); });
    }
    return { ...JSON.parse(response.text || '{}'), groundingLinks };
  } catch (e) { throw e; }
}

export async function getLiveNewsSummary(language: AppLanguage): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: [{ role: 'user', parts: [{ text: `Provide a 2-sentence factual update on Kenyan news in ${language}.` }] }],
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "No news found.";
  } catch (err) { return "Checking official sources..."; }
}

function decode(base64: string) {
  const b = atob(base64);
  const bytes = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) { bytes[i] = b.charCodeAt(i); }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) { channelData[i] = dataInt16[i * numChannels + channel] / 32768.0; }
  }
  return buffer;
}

export async function fetchTTSBuffer(text: string, language: AppLanguage = 'ENG', voice: string = 'Kore'): Promise<AudioBuffer | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ role: 'user', parts: [{ text }] }],
      config: { responseModalities: [Modality.AUDIO] },
    });
    const b64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!b64) return null;
    return await decodeAudioData(decode(b64), getAudioCtx(), 24000, 1);
  } catch (e) { return null; }
}

export async function speakText(text: string, language: AppLanguage = 'ENG'): Promise<void> {
  const buf = await fetchTTSBuffer(text, language);
  if (!buf) return;
  const ctx = getAudioCtx();
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.connect(ctx.destination);
  return new Promise((r) => { src.onended = () => r(); src.start(); });
}

export async function chatAssistant(message: string, language: AppLanguage, history: any[] = []): Promise<{text: string, links: GroundingLink[]}> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: [...history, { role: 'user', parts: [{ text: message }] }],
      config: { tools: [{ googleSearch: {} }] }
    });
    const links: GroundingLink[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => { if (chunk.web?.uri) links.push({ uri: chunk.web.uri, title: chunk.web.title || "Ref" }); });
    }
    return { text: response.text || "...", links };
  } catch (e) { return { text: "Connection error.", links: [] }; }
}
