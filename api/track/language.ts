export default async function handler(req: Request): Promise<Response> {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

export const config = { runtime: "edge" };
