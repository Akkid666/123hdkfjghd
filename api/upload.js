import crypto from "node:crypto";
import { put } from "@vercel/blob";
import { requireAuth, safeName } from "../lib/auth.js";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  if (!requireAuth(req, res)) return;

  let suppliedName = req.headers["x-file-name"] || "file";
  try { suppliedName = decodeURIComponent(String(suppliedName)); } catch {}
  const name = safeName(suppliedName);
  const MAX = 4 * 1024 * 1024;
  const declaredSize = Number(req.headers["content-length"] || 0);
  if (declaredSize > MAX) return res.status(413).json({ error: "Each file must be 4 MB or smaller." });

  try {
    const chunks = [];
    let total = 0;
    for await (const chunk of req) {
      total += chunk.length;
      if (total > MAX) return res.status(413).json({ error: "Each file must be 4 MB or smaller." });
      chunks.push(chunk);
    }
    if (!total) return res.status(400).json({ error: "Empty file." });

    const pathname = `uploads/${Date.now()}-${crypto.randomBytes(6).toString("hex")}-${name}`;
    const blob = await put(pathname, Buffer.concat(chunks), {
      access: "private",
      addRandomSuffix: false,
      contentType: "application/octet-stream"
    });
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ ok: true, name, pathname: blob.pathname, size: total });
  } catch (error) {
    return res.status(500).json({ error: "Upload failed. Check your private Blob store and environment variables." });
  }
}
