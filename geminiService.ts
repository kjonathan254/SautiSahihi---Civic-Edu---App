
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Verdict, FactCheckResult, AppLanguage, GroundingLink } from './types.ts';
import { saveToCache, getFromCache } from './utils.ts';
import { generateHFImage } from './hfService.ts';

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

  const contents: any[] = [{
    role: 'user',
    parts: [{ text: prompt }]
  }];

  if (imageBase64) {
    contents[0].parts.push({
      inlineData: {
        data: imageBase64.split(',')[1],
        mimeType: 'image/png'
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Pro for search grounding
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
      contents: [{ role: 'user', parts: [{ text: `Provide a 2-sentence factual update on Kenyan election news for a senior in ${language}.` }] }],
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "No news found.";
  } catch (err) {
    handleApiError(err);
    return "Official sources are currently being updated. Please check back in a few minutes.";
  }
}

/**
 * SMART CONTEXT-AWARE IMAGE ORCHESTRATOR
 * Tries: Gemini -> Hugging Face -> Hardcoded Local Fallback
 */
export async function generateTopicImage(prompt: string, topicId: string, context?: string, fallbackUrl?: string): Promise<string> {
  const cacheKey = `img_topic_${topicId}`;
  
  // 0. Check Offline Cache
  const cached = await getFromCache(cacheKey);
  if (cached) return cached;

  // 1. Prompt Enrichment (Understanding Context)
  let enrichedPrompt = `A high-quality, photorealistic Kenyan civic scene: ${prompt}`;
  try {
    if (context) {
      const aiPromptRefiner = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const refinement = await aiPromptRefiner.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: `Based on this text: "${context}", write a 1-sentence highly descriptive image generation prompt for a photorealistic scene in Kenya. Focus on dignity and clarity.` }] }]
      });
      if (refinement.text) enrichedPrompt = refinement.text;
    }
  } catch (refinementError) {
    console.warn("Prompt enrichment failed, using base prompt.");
  }

  // 2. Try Gemini Image Generation
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ role: 'user', parts: [{ text: `${enrichedPrompt}. Cinematic lighting, 4k resolution, culturally respectful.` }] }],
      config: { imageConfig: { aspectRatio: "16:9" } }
    });

    const imgPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (imgPart?.inlineData) {
      const b64 = `data:image/png;base64,${imgPart.inlineData.data}`;
      await saveToCache(cacheKey, b64);
      return b64;
    }
  } catch (geminiError) {
    console.warn(`Gemini image failed for ${topicId}. Trying Hugging Face fallback...`);
  }
    
  // 3. Try Hugging Face Fallback (FLUX.1-schnell)
  try {
    const hfBase64 = await generateHFImage(enrichedPrompt);
    await saveToCache(cacheKey, hfBase64);
    return hfBase64;
  } catch (hfError) {
    console.warn(`Hugging Face also unavailable for ${topicId}. Using static fallback.`);
  }
  
  // 4. Final Fallback (Reliable static asset)
  return fallbackUrl || `https://picsum.photos/seed/kenya_${topicId}/800/450`;
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

export async function fetchTTSBuffer(text: string, language: AppLanguage = 'ENG', voice: string = 'Kore'): Promise<AudioBuffer | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Map languages to descriptive prompts for better pronunciation
  const langMap: Record<AppLanguage, string> = {
    ENG: "English",
    KIS: "Kiswahili",
    GIK: "Gikuyu",
    DHO: "Dholuo",
    LUH: "Luhya"
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ 
        role: 'user', 
        parts: [{ text: `Speak clearly and at a respectful, moderate pace for an elder in ${langMap[language] || 'English'}: ${text}` }] 
      }],
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

export async function speakText(text: string, language: AppLanguage = 'ENG'): Promise<void> {
  const ctx = getAudioCtx(); 
  const audioBuffer = await fetchTTSBuffer(text, language);
  if (!audioBuffer) return;

  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(ctx.destination);
  return new Promise((resolve) => {
    source.onended = () => resolve();
    source.start();
  });
}

export async function chatAssistant(message: string, language: AppLanguage, history: any[] = []): Promise<{text: string, links: GroundingLink[]}> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `
    You are SautiSahihi Civic Guide for Kenyan seniors.
    CRITICAL RULES FOR READABILITY:
    1. Respond in ${language}.
    2. USE CLEAR BULLET POINTS OR NUMBERED LISTS for instructions.
    3. KEEP SENTENCES SHORT.
    4. Provide actionable advice (e.g., "Visit the office", "Carry your ID").
    5. Be respectful and use honorifics appropriate for an elder.
    6. Use Google Search to provide up-to-date news and office locations.
  `;
  
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
        // Fix: Changed groundingLinks.push to links.push as 'links' is the correct defined variable for this scope
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
