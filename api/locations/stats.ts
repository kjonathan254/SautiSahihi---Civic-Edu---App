export default async function handler(req: Request): Promise<Response> {
  const stats = {
    "Mombasa-Mvita": 48,
    "Nairobi-Town West": 35,
    "Kisumu-Central": 22,
    "Nakuru-Town East": 18,
    "Kajiado-North": 12
  };

  return new Response(JSON.stringify(stats), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

export const config = { runtime: "edge" };
