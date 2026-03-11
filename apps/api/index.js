import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

import pkg from "@prisma/client";
const { PrismaClient } = pkg;

dotenv.config();

// --------------------
// Prisma setup
// --------------------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

// --------------------
// Express setup
// --------------------
const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// --------------------
// Helpers
// --------------------
function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    console.error("AUTH ERROR:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
}

function slugify(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

async function ensureUniqueSlug(base) {
  const safe = slugify(base) || "company";
  let slug = safe;
  let counter = 1;

  while (true) {
    const exists = await prisma.company.findUnique({
      where: { slug },
    });

    if (!exists) return slug;

    counter++;
    slug = `${safe}-${counter}`;
  }
}

// --------------------
// Health
// --------------------
app.get("/", (req, res) => {
  res.send("API OK ✅");
});

// --------------------
// AUTH
// --------------------
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const normalized = String(email).trim().toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: normalized },
    });

    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const user = await prisma.user.create({
      data: {
        email: normalized,
        passwordHash,
      },
    });

    const slug = await ensureUniqueSlug(normalized.split("@")[0]);

    const company = await prisma.company.create({
      data: {
        ownerId: user.id,
        slug,
        name: "Demo Company",
        slogan: "The space to improve business",
      },
    });

    const token = signToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
      },
      companies: [
        {
          id: company.id,
          slug: company.slug,
          name: company.name,
          slogan: company.slogan,
        },
      ],
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const normalized = String(email).trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalized },
      include: { companies: true },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(String(password), user.passwordHash);

    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
      },
      companies: user.companies.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        slogan: c.slogan,
      })),
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// --------------------
// COMPANIES
// --------------------
app.get("/api/companies", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const companies = await prisma.company.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "asc" },
    });

    return res.json({ companies });
  } catch (error) {
    console.error("GET COMPANIES ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/companies", requireAuth, async (req, res) => {
  try {
    const { name, slug, slogan } = req.body || {};
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({ error: "Company name is required" });
    }

    const finalSlug = slug ? slugify(slug) : await ensureUniqueSlug(name);

    const existing = await prisma.company.findUnique({
      where: { slug: finalSlug },
    });

    if (existing) {
      return res.status(409).json({ error: "Slug already exists" });
    }

    const company = await prisma.company.create({
      data: {
        ownerId: userId,
        name: String(name).trim(),
        slug: finalSlug,
        slogan: typeof slogan === "string" ? slogan.trim() : "",
      },
    });

    return res.json({
      ok: true,
      company,
    });
  } catch (error) {
    console.error("CREATE COMPANY ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// --------------------
// CUSTOMER FLOW
// --------------------
app.get("/api/company/:slug/flow", async (req, res) => {
  try {
    const { slug } = req.params;
    const mood = String(req.query.mood || "").toLowerCase();

    const company = await prisma.company.findUnique({
      where: { slug },
    });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    const configs = {
      negative: [
        {
          type: "tag_selector",
          title: "What went wrong?",
          options: ["Slow service", "Rude staff", "Dirty place", "Wrong order", "Price issue"],
        },
        {
          type: "text_input",
          title: "Tell us more (optional)",
          placeholder: "Write details here...",
        },
      ],
      neutral: [
        {
          type: "text_input",
          title: "What can we improve?",
          placeholder: "One thing we could do better...",
        },
      ],
      positive: [
        {
          type: "text_input",
          title: "What did you like most?",
          placeholder: "What made it great?",
        },
      ],
    };

    if (!configs[mood]) {
      return res.status(400).json({ error: "Invalid mood" });
    }

    return res.json({
      company,
      mood,
      blocks: configs[mood],
    });
  } catch (error) {
    console.error("FLOW ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// --------------------
// FEEDBACK
// --------------------
app.post("/api/feedback", async (req, res) => {
  try {
    const { companySlug, mood, tags, comment } = req.body || {};

    if (!companySlug || !mood) {
      return res.status(400).json({ error: "companySlug and mood are required" });
    }

    const company = await prisma.company.findUnique({
      where: { slug: companySlug },
    });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    const item = await prisma.feedback.create({
      data: {
        companyId: company.id,
        mood: String(mood).toLowerCase(),
        tags: Array.isArray(tags) ? tags : [],
        comment: typeof comment === "string" ? comment : "",
      },
    });

    return res.json({
      ok: true,
      item,
    });
  } catch (error) {
    console.error("SUBMIT FEEDBACK ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// --------------------
// ADMIN SUMMARY
// --------------------
app.get("/api/admin/summary", requireAuth, async (req, res) => {
  try {
    const companySlug = String(req.query.companySlug || "");

    const company = await prisma.company.findUnique({
      where: { slug: companySlug },
    });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    const total = await prisma.feedback.count({
      where: { companyId: company.id },
    });

    const negative = await prisma.feedback.count({
      where: { companyId: company.id, mood: "negative" },
    });

    const neutral = await prisma.feedback.count({
      where: { companyId: company.id, mood: "neutral" },
    });

    const positive = await prisma.feedback.count({
      where: { companyId: company.id, mood: "positive" },
    });

    return res.json({
      total,
      moods: {
        negative,
        neutral,
        positive,
      },
    });
  } catch (error) {
    console.error("ADMIN SUMMARY ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// --------------------
// ADMIN FEEDBACK
// --------------------
app.get("/api/admin/feedback", requireAuth, async (req, res) => {
  try {
    const companySlug = String(req.query.companySlug || "");
    const limit = Number(req.query.limit || 50);

    const company = await prisma.company.findUnique({
      where: { slug: companySlug },
    });

    if (!company) {
      return res.json({ items: [] });
    }

    const items = await prisma.feedback.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return res.json({ items });
  } catch (error) {
    console.error("ADMIN FEEDBACK ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// --------------------
// START
// --------------------
const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running: http://localhost:${PORT}`);
});