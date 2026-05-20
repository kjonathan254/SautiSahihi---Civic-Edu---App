export default async function handler(req: Request): Promise<Response> {
  const faqs = [
    { id: 1, question: "How do I register to vote?", answer: "Visit any IEBC constituency office with your original National ID or valid Passport. Registration is continuous.", visits: 120 },
    { id: 2, question: "What is the KIEMS kit?", answer: "The Kenya Integrated Election Management System (KIEMS) is a biometric device used to identify voters and transmit results securely.", visits: 85 },
    { id: 3, question: "What documents do I need to vote?", answer: "On election day, you must carry the same original National ID or Passport you used during registration.", visits: 50 },
    { id: 4, question: "How do I verify my status?", answer: "You can check your registration status by sending your ID/Passport number via SMS to the official IEBC code (e.g. 70000) or visiting their website.", visits: 40 },
    { id: 5, question: "What rights do I have at the station?", answer: "As a voter, you have the right to a secret ballot. Seniors and people with disabilities have the right to go to the front of the line.", visits: 30 },
    { id: 6, question: "Can I vote anywhere in Kenya?", answer: "No, you must vote at the specific polling station where you are registered. You can apply to transfer your registration before the deadline.", visits: 20 }
  ];

  return new Response(JSON.stringify(faqs), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

export const config = { runtime: "edge" };
