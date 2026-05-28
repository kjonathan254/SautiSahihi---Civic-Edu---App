export default async function handler(req: Request): Promise<Response> {
  const stats = {
    languages: { ENG: 142, KIS: 218, GIK: 45, DHO: 32, LUH: 28, KAL: 12, KAM: 18 },
    pollParticipation: 94,
    learnViews: { "kiems-kit": 52, "rights-senior": 84, "civic-peace": 41 },
    assistantQueries: 350,
    totalFactChecks: 58,
    totalLocationVisits: 135
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
