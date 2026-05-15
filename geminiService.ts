import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Verdict, FactCheckResult, AppLanguage, GroundingLink } from './types.ts';
import { saveToCache, getFromCache } from './utils.ts';
import { nvidiaChat, nvidiaGenerateImage } from './nvidiaService.ts';

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
  const cacheKey = `img_v6_${topicId}`;
  
  // 1. Check Cache
  const cached = await getFromCache(cacheKey);
  if (cached) return cached;

  // 2. Refine Prompt (Optimized for NVIDIA/Kenyan Context)
  let refinedPrompt = prompt;
  try {
    const aiRefiner = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || "" });
    const refinement = await aiRefiner.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: [{ role: 'user', parts: [{ text: `Create a 1-sentence cinematic photo prompt for: "${prompt}". Focus on: Kenyan citizens, realistic lighting, Nairobi atmosphere, high dignity. Context: ${context || 'Kenyan civic life'}. Style: Photorealistic 8k, cinematic lighting.` }] }]
    });
    if (refinement.text) refinedPrompt = refinement.text;
  } catch (e) {
    refinedPrompt = `${prompt}, photorealistic, Kenyan context, high quality, 8k`;
  }

  // 3. Try NVIDIA Generation (High Fidelity)
  try {
    const nvidiaImg = await nvidiaGenerateImage(refinedPrompt);
    if (nvidiaImg) {
      await saveToCache(cacheKey, nvidiaImg);
      return nvidiaImg;
    }
  } catch (e) {
    console.warn("NVIDIA Image generation failed, falling back to static asset/Gemini.");
  }

  // 4. Try Gemini Image Generation
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || "" });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash', 
      contents: [{ role: 'user', parts: [{ text: refinedPrompt }] }],
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    const imgPart = response.candidates?.[0]?.content?.parts.find(p => (p as any).inlineData);
    if (imgPart && (imgPart as any).inlineData) {
      const b64 = `data:image/png;base64,${(imgPart as any).inlineData.data}`;
      await saveToCache(cacheKey, b64);
      return b64;
    }
  } catch (e) {
    console.warn("Gemini Image generation failed.");
  }
  
  // 5. Final Fallback (Prioritize provided /assets/ path)
  return fallbackUrl || `https://picsum.photos/seed/${topicId}/800/450`;
}

export async function fastAIResponse(prompt: string): Promise<string> {
  // 1. Try NVIDIA First (High Speed)
  try {
    const text = await nvidiaChat([{ role: 'user', content: prompt }], "meta/llama-3.1-8b-instruct");
    if (text) return text;
  } catch (e) {
    console.warn("NVIDIA fast response failed, falling back to Gemini.");
  }

  // 2. Fallback to Gemini
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || "" });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    return response.text || "No response.";
  } catch (e) {
    return "I am having trouble connecting to my reasoning engines. Please try again.";
  }
}

export async function factCheckClaim(claim: string, imageBase64?: string, language: AppLanguage = 'ENG'): Promise<FactCheckResult & { groundingLinks?: GroundingLink[] }> {
  let geminiResult: any = null;
  let groundingLinks: GroundingLink[] = [];

  // 1. Try Gemini first because of Multimodal + Search Grounding
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || "" });
    const prompt = `Fact-check this claim for a Kenyan audience: "${claim}". Respond in ${language}. Use JSON format. Structure: { verdict: "TRUE"|"FALSE"|"MISLEADING", summary: "Short one-liner", explanation: "Detailed reasoning", sources: ["source1", "source2"] }`;
    const contents: any[] = [{ role: 'user', parts: [{ text: prompt }] }];
    if (imageBase64) {
      contents[0].parts.push({ inlineData: { data: imageBase64.split(',')[1], mimeType: 'image/png' } });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash', 
      contents,
      config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
    });
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => { if (chunk.web?.uri) groundingLinks.push({ uri: chunk.web.uri, title: chunk.web.title || "Source" }); });
    }
    geminiResult = JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Gemini Fact Check failed, attempting NVIDIA fallback", e);
  }

  // 2. If Gemini failed OR for Cross-Verification
  try {
    const checkPrompt = geminiResult 
      ? `Verify this fact-check result for accuracy: Claim: "${claim}", Verdict: "${geminiResult.verdict}", Explanation: "${geminiResult.explanation}". Refine it for a Kenyan context. Respond in JSON.`
      : `Fact-check this Kenyan claim: "${claim}". Respond in ${language} using this JSON structure: { verdict: "TRUE"|"FALSE"|"MISLEADING", summary: "one-liner", explanation: "detailed reasoning", sources: [] }.`;
    
    const nvidiaResponse = await nvidiaChat([{ role: "user", content: checkPrompt }]);
    if (nvidiaResponse) {
      const refined = JSON.parse(nvidiaResponse.substring(nvidiaResponse.indexOf('{'), nvidiaResponse.lastIndexOf('}') + 1));
      return { ...refined, groundingLinks };
    }
  } catch (e) {
    console.warn("NVIDIA Fact Check fallback failed.");
  }

  if (geminiResult) {
    return { ...geminiResult, groundingLinks };
  }

  throw new Error("We encountered an error while verifying this claim. Please try again shortly.");
}

export async function getLiveNewsSummary(language: AppLanguage): Promise<string> {
  // 1. Try Gemini first (Best for Live Search/Grounding)
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || "" });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: `Provide a 2-sentence factual update on Kenyan civic news in ${language}. Include dates if possible.` }] }],
      config: { tools: [{ googleSearch: {} }] }
    });
    if (response.text) return `[LATEST NEWS] ${response.text}`;
  } catch (err) { 
    console.log("Switching news engine...");
  }

  // 2. Fallback to NVIDIA (Powerful Reasoning)
  try {
    const text = await nvidiaChat([{ role: 'user', content: `Summarize the most recent significant civic or political news in Kenya from the last 24-48 hours. Provide a concise 2-sentence summary in ${language}.` }]);
    if (text) return `[CIVIC UPDATE] ${text}`;
  } catch (e) {
    console.warn("NVIDIA News fallback failed.");
  }

  return "Checking official Kenyan sources for the latest updates...";
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

export async function fetchTTSBase64(text: string, language: AppLanguage = 'ENG'): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || "" });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ role: 'user', parts: [{ text }] }],
      config: { responseModalities: [Modality.AUDIO] },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (e) { return null; }
}

export async function fetchTTSBuffer(text: string, language: AppLanguage = 'ENG'): Promise<AudioBuffer | null> {
  const b64 = await fetchTTSBase64(text, language);
  if (!b64) return null;
  return await decodeAudioData(decode(b64), getAudioCtx(), 24000, 1);
}

export async function bufferFromBase64(b64: string): Promise<AudioBuffer | null> {
  return await decodeAudioData(decode(b64), getAudioCtx(), 24000, 1);
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

export async function getLearnTopicContent(topic: string, description: string, language: AppLanguage): Promise<{ summary: string, detailed: string }> {
  try {
    const prompt = `Act as an educational expert for Kenyan senior citizens. Explain the civic topic "${topic}" based on this context: "${description}". 
    Create a concise 1-sentence summary and a detailed explanation (3-4 clear, respectful, and encouraging sentences).
    Respond in ${language}. 
    Use JSON format: { "summary": "...", "detailed": "..." }`;
    
    // Offload to NVIDIA Llama 3 for non-factual/educational enrichment
    const response = await nvidiaChat([{ role: 'user', content: prompt }], "meta/llama-3.1-8b-instruct");
    const cleaned = response.substring(response.indexOf('{'), response.lastIndexOf('}') + 1);
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to enrich learn content with NVIDIA", e);
    throw e;
  }
}

export async function chatAssistant(message: string, language: AppLanguage, history: any[] = []): Promise<{text: string, links: GroundingLink[]}> {
  // 1. Try NVIDIA (Advanced Reasoning)
  try {
    const nvidiaMessages = [
      { role: "system", content: `You are SautiSahihi, a dignified and truthful civic assistant for Kenya. Respond in ${language}. Use clear, senior-friendly language. Provide factual information about laws, voting, and rights.` },
      ...history.map(h => ({ role: h.role === 'model' ? 'assistant' : h.role, content: h.parts[0].text })),
      { role: "user", content: message }
    ];
    const text = await nvidiaChat(nvidiaMessages);
    if (text) return { text, links: [] };
  } catch (e) {
    console.warn("NVIDIA Assistant failed, falling back to Gemini.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || "" });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
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
