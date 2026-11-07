import { get } from "@vercel/blob";
import { Readable } from "node:stream";
import { requireAuth, safeName } from "../lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).send("Method not allowed.");
  if (!requireAuth(req, res)) return;

  const pathname = String(req.query.pathname || "");
  if (!pathname.startsWith("uploads/") || pathname.includes("..") || pathname.includes("\\\\")) {
    return res.status(400).send("Invalid file path.");
  }

  try {
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200) return res.status(404).send("File not found.");

    const filename = safeName(pathname.split("/").pop());
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${filename.replace(/"/g, "")}"`);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, no-store");
    Readable.fromWeb(result.stream).pipe(res);
  } catch (error) {
    return res.status(404).send("File not found.");
  }
}
