import express from "express";
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
      { id: 1, question: "How do I register to vote?", answer: "You can register at any IEBC constituency office with your original ID or Passport.", visits: 120 },
      { id: 2, question: "What is the KIEMS kit?", answer: "It is a biometric device used to identify voters and transmit results.", visits: 85 }
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
      const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(req.body)
      });

      const result = await response.json();
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

    // Default to Stable Diffusion XL on NVIDIA NIM if no specific model provided
    const modelUrl = req.body.url || "https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-xl";
    
    try {
      const response = await fetch(modelUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json"
        },
        body: JSON.stringify(req.body.payload)
      });

      const result = await response.json();
      if (!response.ok) {
        console.error("NVIDIA API Error Response:", JSON.stringify(result));
      }
      res.status(response.status).json(result);
    } catch (error) {
      console.error("NVIDIA Image Proxy Error:", error);
      res.status(500).json({ error: "Failed to connect to NVIDIA Image API" });
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
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
