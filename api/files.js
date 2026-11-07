import { list } from "@vercel/blob";
import { requireAuth } from "../lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed." });
  if (!requireAuth(req, res)) return;
  try {
    const result = await list({ prefix: "uploads/", limit: 1000, access: "private" });
    const files = result.blobs.map(blob => ({
      pathname: blob.pathname,
      name: blob.pathname.split("/").pop(),
      size: blob.size,
      uploadedAt: blob.uploadedAt
    }));
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ files });
  } catch (error) {
    return res.status(500).json({ error: "Could not list files. Check the private Blob store configuration." });
  }
}
