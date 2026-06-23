import express from "express";
import session from "express-session";
import { nanoid } from "nanoid";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createPost, listPosts } from "./storage.js";
import {
  generateVerificationCode,
  isCuhkStudentEmail,
  normalizeEmail,
} from "./verification.js";
import { validatePostPayload } from "./validation.js";

const VERIFICATION_TTL_MS = 10 * 60 * 1000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIRECTORY = path.join(__dirname, "..", "public");

export function createApp() {
  const app = express();
  const pendingVerification = new Map();

  app.use(express.json());
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "dev-only-cuhk-roommate-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        sameSite: "lax",
      },
    }),
  );
  app.use(express.static(PUBLIC_DIRECTORY));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/auth/status", (req, res) => {
    res.json({
      verified: Boolean(req.session.user?.verified),
      email: req.session.user?.email || null,
    });
  });

  app.post("/api/verification/request", (req, res) => {
    const email = normalizeEmail(req.body?.email);

    if (!isCuhkStudentEmail(email)) {
      return res.status(400).json({
        error:
          "Please use a valid CUHK student email address (@link.cuhk.edu.hk or @cuhk.edu.hk).",
      });
    }

    const code = generateVerificationCode();
    pendingVerification.set(email, {
      code,
      expiresAt: Date.now() + VERIFICATION_TTL_MS,
    });

    return res.json({
      message:
        "Verification code generated. In production, this should be emailed to the user.",
      // This is only for local MVP testing before email service integration.
      devVerificationCode: process.env.NODE_ENV === "production" ? undefined : code,
      expiresInMinutes: VERIFICATION_TTL_MS / 60_000,
    });
  });

  app.post("/api/verification/confirm", (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const code = String(req.body?.code || "").trim();
    const pending = pendingVerification.get(email);

    if (!pending) {
      return res.status(400).json({ error: "No verification request found." });
    }

    if (Date.now() > pending.expiresAt) {
      pendingVerification.delete(email);
      return res.status(400).json({ error: "Verification code has expired." });
    }

    if (pending.code !== code) {
      return res.status(400).json({ error: "Invalid verification code." });
    }

    req.session.user = {
      verified: true,
      email,
      verifiedAt: new Date().toISOString(),
    };
    pendingVerification.delete(email);

    return res.json({
      verified: true,
      email,
    });
  });

  app.get("/api/posts", async (_req, res, next) => {
    try {
      const posts = await listPosts();
      res.json({ posts });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/posts", async (req, res, next) => {
    try {
      if (!req.session.user?.verified) {
        return res.status(401).json({
          error: "You must verify with a CUHK student email before posting.",
        });
      }

      const { errors, normalized } = validatePostPayload(req.body || {});
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const post = {
        id: nanoid(10),
        ...normalized,
        createdAt: new Date().toISOString(),
        authorEmail: req.session.user.email,
      };

      await createPost(post);
      return res.status(201).json({ post });
    } catch (error) {
      return next(error);
    }
  });

  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
