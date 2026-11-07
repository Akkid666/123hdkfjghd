import crypto from "node:crypto";

const COOKIE_NAME = "pfs_session";
const SESSION_SECONDS = 60 * 60 * 12;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters.");
  return value;
}

function sign(value) {
  return crypto.createHmac("sha256", secret()).update(value).digest("base64url");
}

export function createSessionCookie() {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = String(expires);
  const token = `${payload}.${sign(payload)}`;
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_SECONDS}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

export function isAuthenticated(req) {
  try {
    const cookieHeader = req.headers.cookie || "";
    const entry = cookieHeader.split(";").map(v => v.trim()).find(v => v.startsWith(`${COOKIE_NAME}=`));
    if (!entry) return false;
    const token = entry.slice(COOKIE_NAME.length + 1);
    const [payload, signature] = token.split(".");
    if (!payload || !signature || Number(payload) < Math.floor(Date.now() / 1000)) return false;
    const expected = sign(payload);
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function requireAuth(req, res) {
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: "Sign in required." });
    return false;
  }
  return true;
}

export function safeName(name) {
  const base = String(name || "file").split(/[\\\\/]/).pop().replace(/[^a-zA-Z0-9._ -]/g, "_").slice(0, 100);
  return base && base !== "." && base !== ".." ? base : "file";
}
