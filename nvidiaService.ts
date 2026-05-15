/**
 * NVIDIA NIM SERVICE
 * Integrated via server-side proxy to ensure API Key security.
 */

export async function nvidiaChat(messages: { role: string; content: string }[], model: string = "meta/llama-4-maverick-17b-128e-instruct"): Promise<string> {
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
    return data.choices?.[0]?.message?.content || "I am currently processing that request.";
  } catch (error) {
    console.error("NVIDIA Chat Error:", error);
    throw error;
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
          text_prompts: [{ text: enhancedPrompt }],
          cfg_scale: 7,
          sampler: "K_DPM_2_ANCESTRAL",
          steps: 30
        }
      })
    });

    const data = await response.json();
    
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
    throw new Error("No image data returned from NVIDIA");
  } catch (error) {
    console.error("NVIDIA Image Generation Error:", error);
    throw error;
  }
}
