export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "NVIDIA_API_KEY not configured." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const body = await req.json();

  try {
    const response = await fetch(
      "https://ai.api.nvidia.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(body)
      }
    );

    const contentType = response.headers.get("content-type");
    let result;

    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
    } else {
      const raw = await response.text();
      console.error("NVIDIA Chat Response NOT JSON. Status:", response.status, "Body:", raw.substring(0, 500));
      return new Response(
        JSON.stringify({ 
          error: `NVIDIA Chat returned ${contentType || 'non-JSON'}`, 
          status: response.status,
          preview: raw.substring(0, 200) 
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(result), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("NVIDIA Chat Proxy Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to connect to NVIDIA Chat API" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export const config = { runtime: "edge" };
