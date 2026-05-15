import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- In-Memory Data Store (Simulating a Database) ---
  const data = {
    faqs: [
      { id: 1, question: "How do I register to vote?", answer: "Visit any IEBC constituency office with your original National ID or valid Passport. Registration is continuous.", visits: 120 },
      { id: 2, question: "What is the KIEMS kit?", answer: "The Kenya Integrated Election Management System (KIEMS) is a biometric device used to identify voters and transmit results securely.", visits: 85 },
      { id: 3, question: "What documents do I need to vote?", answer: "On election day, you must carry the same original National ID or Passport you used during registration.", visits: 50 },
      { id: 4, question: "How do I verify my status?", answer: "You can check your registration status by sending your ID/Passport number via SMS to the official IEBC code (e.g. 70000) or visiting their website.", visits: 40 },
      { id: 5, question: "What rights do I have at the station?", answer: "As a voter, you have the right to a secret ballot. Seniors and people with disabilities have the right to go to the front of the line.", visits: 30 },
      { id: 6, question: "Can I vote anywhere in Kenya?", answer: "No, you must vote at the specific polling station where you are registered. You can apply to transfer your registration before the deadline.", visits: 20 }
    ],
    locationVisits: {} as Record<string, number>,
    factChecks: [] as any[],
    languageStats: { ENG: 0, KIS: 0, GIK: 0, DHO: 0, LUH: 0 } as Record<string, number>,
    pollParticipation: 0,
    learnTopicViews: {} as Record<string, number>,
    assistantQueries: 0
  };

  // --- API Routes ---

  // Analytics Tracking Endpoints
  app.post("/api/track/language", (req, res) => {
    const { lang } = req.body;
    if (lang && data.languageStats[lang] !== undefined) {
      data.languageStats[lang]++;
      res.json({ success: true });
    } else res.status(400).send();
  });

  app.post("/api/track/poll", (req, res) => {
    data.pollParticipation++;
    res.json({ success: true });
  });

  app.post("/api/track/learn", (req, res) => {
    const { topicId } = req.body;
    if (topicId) {
      data.learnTopicViews[topicId] = (data.learnTopicViews[topicId] || 0) + 1;
      res.json({ success: true });
    } else res.status(400).send();
  });

  app.post("/api/track/assistant", (req, res) => {
    data.assistantQueries++;
    res.json({ success: true });
  });

  app.get("/api/admin/stats", (req, res) => {
    res.json({
      languages: data.languageStats,
      pollParticipation: data.pollParticipation,
      learnViews: data.learnTopicViews,
      assistantQueries: data.assistantQueries,
      totalFactChecks: data.factChecks.length,
      totalLocationVisits: Object.values(data.locationVisits).reduce((a, b) => a + b, 0)
    });
  });

  // FAQ Endpoints
  app.get("/api/faqs", (req, res) => {
    res.json(data.faqs.sort((a, b) => b.visits - a.visits));
  });

  app.post("/api/faqs/:id/visit", (req, res) => {
    const faq = data.faqs.find(f => f.id === parseInt(req.params.id));
    if (faq) {
      faq.visits++;
      res.json({ success: true, visits: faq.visits });
    } else {
      res.status(404).json({ error: "FAQ not found" });
    }
  });

  // IEBC Location Analytics
  app.post("/api/locations/visit", (req, res) => {
    const { locationId } = req.body;
    if (!locationId) return res.status(400).json({ error: "locationId required" });
    
    data.locationVisits[locationId] = (data.locationVisits[locationId] || 0) + 1;
    res.json({ success: true, visits: data.locationVisits[locationId] });
  });

  app.get("/api/locations/stats", (req, res) => {
    res.json(data.locationVisits);
  });

  // Fact Check History
  app.get("/api/fact-checks", (req, res) => {
    res.json(data.factChecks.slice(-20).reverse()); // Return last 20
  });

  app.post("/api/fact-checks", (req, res) => {
    const { claim, verdict, explanation } = req.body;
    const newEntry = {
      id: Date.now(),
      claim,
      verdict,
      explanation,
      timestamp: new Date().toISOString()
    };
    data.factChecks.push(newEntry);
    res.json(newEntry);
  });

  // --- NVIDIA NIM Proxy Endpoints ---
  // To secure the NVIDIA API Key, we proxy requests through the backend.
  
  app.post("/api/nvidia/chat", async (req, res) => {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "NVIDIA_API_KEY not configured on server." });
    }

    try {
      const response = await fetch("https://ai.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json"
        },
        body: JSON.stringify(req.body)
      });

      const contentType = response.headers.get("content-type");
      let result;

      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const raw = await response.text();
        console.error("NVIDIA Chat Response NOT JSON. Status:", response.status, "Body:", raw.substring(0, 500));
        return res.status(response.status).json({ 
          error: `NVIDIA Chat returned ${contentType || 'non-JSON'}`, 
          status: response.status,
          preview: raw.substring(0, 500) 
        });
      }

      res.status(response.status).json(result);
    } catch (error) {
      console.error("NVIDIA Chat Proxy Error:", error);
      res.status(500).json({ error: "Failed to connect to NVIDIA API" });
    }
  });

  app.post("/api/generate-image", async (req, res) => {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "NVIDIA_API_KEY not configured on server." });
    }

    const { url, payload } = req.body;
    
    try {
      const targetUrl = url || "https://ai.api.nvidia.com/v1/genai/stabilityai/sdxl";
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const contentType = response.headers.get("content-type");
      let result;
      
      if (contentType && contentType.includes("application/json")) {
        const text = await response.text();
        try {
          result = JSON.parse(text);
        } catch (e) {
          console.error("NVIDIA Image Response marked as JSON but failed to parse. Status:", response.status, "Text:", text.substring(0, 500));
          res.status(500).json({ error: "Invalid JSON response from NVIDIA", status: response.status, raw: text.substring(0, 500) });
          return;
        }
      } else {
        const raw = await response.text();
        console.error("NVIDIA Image Response NOT JSON. Status:", response.status, "Content-Type:", contentType, "Body:", raw.substring(0, 500));
        res.status(500).json({ 
          error: `NVIDIA Image API returned ${contentType || 'unknown content type'}`, 
          status: response.status,
          preview: raw.substring(0, 500) 
        });
        return;
      }

      if (!response.ok) {
        console.error("NVIDIA API Error Response:", JSON.stringify(result));
      }
      res.status(response.status).json(result);
    } catch (error) {
      console.error("NVIDIA Image Proxy Error:", error.message);
      res.status(500).json({ error: error.message || "Failed to connect to NVIDIA Image API" });
    }
  });

  // --- Civic Knowledge Search Endpoint ---
  app.get("/api/civic", async (req, res) => {
    const { q } = req.query;
    if (typeof q !== "string") {
      return res.json({ results: [] });
    }
    
    try {
      // Lazy load logic
      const { searchCivicKnowledge } = await import("./lib/searchKnowledge.ts");
      const results = searchCivicKnowledge(q);
      res.json({ results });
    } catch (error) {
      console.error("Civic Search Error:", error);
      res.status(500).json({ error: "Failed to search civic knowledge" });
    }
  });

  // --- Vite Middleware for Development ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
