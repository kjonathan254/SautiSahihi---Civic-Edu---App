/**
 * Hugging Face Inference Service
 * Used for specialized "narrow" tasks like Sentiment, Translation, or Image Generation
 */

const HF_API_URL = "https://api-inference.huggingface.co/models/";

export interface HFToneResult {
  label: string;
  score: number;
}

/**
 * Helper to convert Blob to Base64
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Wait helper for retries
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Analyzes text to see if it is "Fear-mongering", "Informative", or "Clickbait"
 */
export async function analyzeNewsTone(text: string): Promise<HFToneResult[]> {
  const model = "facebook/bart-large-mnli";
  try {
    const response = await fetch(`${HF_API_URL}${model}`, {
      method: "POST",
      body: JSON.stringify({
        inputs: text,
        parameters: { candidate_labels: ["Fear-mongering", "Informative", "Clickbait", "Calm"] }
      }),
    });

    if (!response.ok) return [];
    const result = await response.json();
    if (result.labels && result.scores) {
      return result.labels.map((label: string, index: number) => ({
        label,
        score: result.scores[index]
      }));
    }
    return [];
  } catch (error) {
    console.error("HF Tone Analysis Network Error:", error);
    return [];
  }
}

/**
 * Translates English text to Kiswahili using Helsinki-NLP/opus-mt-en-sw
 */
export async function translateToKiswahili(text: string): Promise<string> {
  const model = "Helsinki-NLP/opus-mt-en-sw";
  try {
    const response = await fetch(`${HF_API_URL}${model}`, {
      method: "POST",
      body: JSON.stringify({ inputs: text }),
    });

    if (!response.ok) return text;
    const result = await response.json();
    if (Array.isArray(result) && result[0]?.translation_text) {
      return result[0].translation_text;
    }
    return text;
  } catch (error) {
    console.error("HF Translation Network Error:", error);
    return text;
  }
}

/**
 * Generates an image using an open-source model (FLUX.1-schnell)
 * Returns a Base64 string for persistent caching.
 */
export async function generateHFImage(prompt: string, retries = 2): Promise<string> {
  const model = "black-forest-labs/FLUX.1-schnell";
  
  try {
    const response = await fetch(`${HF_API_URL}${model}`, {
      method: "POST",
      // Removed Content-Type to avoid some CORS preflight triggers on busy nodes
      body: JSON.stringify({ inputs: prompt }),
    });

    // Handle busy/loading states
    if (response.status === 503 || response.status === 429 || response.status === 504) {
      if (retries > 0) {
        const waitTime = response.status === 503 ? 10000 : 5000;
        console.warn(`HF model busy (${response.status}). Retrying in ${waitTime/1000}s...`);
        await sleep(waitTime);
        return generateHFImage(prompt, retries - 1);
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HF Status ${response.status}: ${errorText}`);
    }

    const blob = await response.blob();
    if (blob.size < 100) throw new Error("Invalid image returned from HF");
    
    return await blobToBase64(blob);
  } catch (error) {
    // Catch 'Failed to fetch' (TypeError) specifically
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      console.error("Hugging Face Connection Blocked or Offline (CORS/Network)");
    } else {
      console.error("HF Image Generation Error:", error);
    }
    // Re-throw so geminiService knows to use the local fallback
    throw error;
  }
}
