export default async function handler(req: Request): Promise<Response> {
  const mockFactChecks = [
    { 
      id: 1, 
      claim: "IEBC has changed standard physical voting methods to online voting for 2027.", 
      verdict: "FALSE", 
      explanation: "Voting in Kenya is strictly in-person using physical ballot papers at designated polling places. No phone or internet voting exists.", 
      timestamp: new Date().toISOString() 
    },
    { 
      id: 2, 
      claim: "Older citizens are legally allowed to bypass voting lines.", 
      verdict: "TRUE", 
      explanation: "IEBC guidelines and Article 38 resources guarantee express priority access for elderly and disabled voters.", 
      timestamp: new Date().toISOString() 
    }
  ];

  if (req.method === "POST") {
    try {
      const data = await req.json();
      const newEntry = {
        id: Date.now(),
        claim: data.claim || "New Claim",
        verdict: data.verdict || "UNVERIFIED",
        explanation: data.explanation || "Verification pending review.",
        timestamp: new Date().toISOString()
      };
      return new Response(JSON.stringify(newEntry), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid post body" }), { status: 400 });
    }
  }

  return new Response(JSON.stringify(mockFactChecks), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

export const config = { runtime: "edge" };
