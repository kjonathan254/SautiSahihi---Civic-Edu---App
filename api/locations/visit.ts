export default async function handler(req: Request): Promise<Response> {
  return new Response(JSON.stringify({ success: true, visits: 1 }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

export const config = { runtime: "edge" };
