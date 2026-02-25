import crypto from "crypto";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const feedbackStore = [];

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("API OK ✅"));

app.get("/api/company/:slug/flow", (req, res) => {
  const { slug } = req.params;
  const mood = String(req.query.mood || "").toLowerCase();
  app.post("/api/feedback", (req, res) => {
  const { companySlug, mood, tags, comment } = req.body || {};

  if (!companySlug || !mood) {
    return res.status(400).json({ error: "companySlug and mood are required" });
  }

  const item = {
    id: crypto.randomUUID(),
    companySlug,
    mood,
    tags: Array.isArray(tags) ? tags : [],
    comment: typeof comment === "string" ? comment : "",
    createdAt: new Date().toISOString()
  };

  feedbackStore.unshift(item);
  return res.json({ ok: true, item });
});

app.get("/api/admin/summary", (req, res) => {
  const total = feedbackStore.length;
  const moods = { negative: 0, neutral: 0, positive: 0 };

  for (const f of feedbackStore) {
    if (moods[f.mood] !== undefined) moods[f.mood]++;
  }

  return res.json({ total, moods });
});

app.get("/api/admin/feedback", (req, res) => {
  const limit = Math.min(Number(req.query.limit || 50), 200);
  return res.json({ items: feedbackStore.slice(0, limit) });
});


  const configs = {
    negative: [
      {
        type: "tag_selector",
        title: "What went wrong?",
        options: ["Slow service", "Rude staff", "Dirty place", "Wrong order", "Price issue"]
      },
      {
        type: "text_input",
        title: "Tell us more (optional)",
        placeholder: "Write details here..."
      }
    ],
    neutral: [
      {
        type: "text_input",
        title: "What can we improve?",
        placeholder: "One thing we could do better..."
      }
    ],
    positive: [
      {
        type: "text_input",
        title: "What did you like most?",
        placeholder: "What made it great?"
      },
      {
        type: "redirect",
        label: "Leave a public review ⭐",
        url: "https://google.com"
      }
    ]
  };



  if (!configs[mood]) {
    return res.status(400).json({ error: "mood must be negative | neutral | positive" });
  }

  return res.json({
    company: { slug, name: "Demo Company", slogan: "The space to improve business" },
    mood,
    blocks: configs[mood]
  });
});

app.post("/api/feedback", (req, res) => {
  const { companySlug, mood, tags, comment } = req.body || {};

  if (!companySlug || !mood) {
    return res.status(400).json({ error: "companySlug and mood are required" });
  }

  const item = {
    id: crypto.randomUUID(),
    companySlug,
    mood,
    tags: Array.isArray(tags) ? tags : [],
    comment: typeof comment === "string" ? comment : "",
    createdAt: new Date().toISOString()
  };

  feedbackStore.unshift(item); // newest first
  return res.json({ ok: true, item });
});
app.get("/api/admin/summary", (req, res) => {
  const total = feedbackStore.length;
  const moods = { negative: 0, neutral: 0, positive: 0 };

  for (const f of feedbackStore) {
    if (moods[f.mood] !== undefined) moods[f.mood]++;
  }

  res.json({ total, moods });
});

app.get("/api/admin/feedback", (req, res) => {
  const limit = Math.min(Number(req.query.limit || 50), 200);
  res.json({ items: feedbackStore.slice(0, limit) });
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running: http://localhost:${PORT}`);
});
