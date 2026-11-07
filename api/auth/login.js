import crypto from "node:crypto";
import { createSessionCookie } from "../../lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  const supplied = String(req.body?.password || "");
  const expected = process.env.APP_PASSWORD || "";
  if (!expected) return res.status(500).json({ error: "APP_PASSWORD is not configured." });

  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  const valid = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!valid) return res.status(401).json({ error: "Incorrect password." });

  res.setHeader("Set-Cookie", createSessionCookie());
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ ok: true });
}
