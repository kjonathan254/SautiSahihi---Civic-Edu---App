// /app/api/civic/route.ts
// Note: This project currently uses an Express server (server.ts).
// The logic for this route has been integrated into server.ts under /api/civic.

import { searchCivicKnowledge } from '../../../lib/searchKnowledge.ts';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  
  if (!q) {
    return Response.json({ results: [] });
  }

  const results = searchCivicKnowledge(q);
  return Response.json({ results });
}
