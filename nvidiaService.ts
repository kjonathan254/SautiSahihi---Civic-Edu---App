/**
 * NVIDIA NIM SERVICE
 * Integrated via server-side proxy to ensure API Key security.
 */

export async function nvidiaChat(messages: { role: string; content: string }[], model: string = "meta/llama-3.1-8b-instruct"): Promise<string> {
  try {
    const response = await fetch("/api/nvidia/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        top_p: 0.7,
        max_tokens: 1024
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content || content.includes("error") || content.includes("not found")) {
      return null;
    }
    return content;
  } catch (error) {
    console.error("NVIDIA Chat Error:", error);
    return null;
  }
}

export async function nvidiaGenerateImage(prompt: string): Promise<string> {
  try {
    // Enhance prompt for NVIDIA's high-detail generation
    const enhancedPrompt = `${prompt}, photorealistic, 8k resolution, cinematic lighting, ultra-detailed, Kenyan authentic context, natural skin tones, depth of field`;

    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: "https://ai.api.nvidia.com/v1/genai/stabilityai/sdxl",
        payload: {
          text_prompts: [{ text: enhancedPrompt, weight: 1 }],
          cfg_scale: 7,
          sampler: "K_DPM_2_ANCESTRAL",
          steps: 30,
          seed: 0,
          style_preset: "photographic"
        }
      })
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("NVIDIA Proxy returned non-JSON response. Content-Type:", contentType, "Body:", text.substring(0, 500));
      throw new Error(`Server returned non-JSON response (${response.status}). Check if the API route is configured correctly.`);
    }

    const data = await response.json();
    
    if (data.error) {
      console.error("NVIDIA API Error through Proxy:", data.error);
      throw new Error(data.error);
    }
    
    // NVIDIA NIM usually returns base64 in artifacts[0].base64
    if (data.artifacts && data.artifacts[0].base64) {
      return `data:image/png;base64,${data.artifacts[0].base64}`;
    }

    if (data.image) {
       return `data:image/png;base64,${data.image}`;
    }

    if (data.data && data.data[0] && data.data[0].b64_json) {
       return `data:image/png;base64,${data.data[0].b64_json}`;
    }
    
    console.error("NVIDIA Response Data (Missing Artifacts):", JSON.stringify(data));
    console.log("Available keys in NVIDIA response:", Object.keys(data).join(", "));
    throw new Error("No image data returned from NVIDIA");
  } catch (error) {
    console.error("NVIDIA Image Generation Error:", error);
    throw error;
  }
}
