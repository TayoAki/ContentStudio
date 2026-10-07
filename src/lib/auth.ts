import "server-only";
import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db, id } from "./db";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export const SESSION_COOKIE = "cs_session";
const SESSION_DAYS = 30;

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

// ---------- Passwords ----------

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, saltHex, keyHex] = stored.split("$");
  if (algo !== "scrypt" || !saltHex || !keyHex) return false;
  const key = await scrypt(password, Buffer.from(saltHex, "hex"), 64);
  return timingSafeEqual(key, Buffer.from(keyHex, "hex"));
}

// ---------- Users & workspaces ----------

export type Session = { userId: string; email: string; name: string; workspaceId: string; workspaceName: string };

export async function createUserWithWorkspace(email: string, password: string, name: string, workspaceName: string) {
  const conn = db();
  const userId = id("usr");
  const workspaceId = id("ws");
  const passwordHash = await hashPassword(password);
  conn.exec("BEGIN");
  try {
    conn.prepare("INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)").run(userId, email, name, passwordHash);
    conn
      .prepare("INSERT INTO workspaces (id, name, manychat_secret) VALUES (?, ?, ?)")
      .run(workspaceId, workspaceName, randomBytes(18).toString("base64url"));
    conn.prepare("INSERT INTO memberships (user_id, workspace_id, role) VALUES (?, ?, 'owner')").run(userId, workspaceId);
    conn.exec("COMMIT");
  } catch (err) {
    conn.exec("ROLLBACK");
    throw err;
  }
  return { userId, workspaceId };
}

export function findUserByEmail(email: string) {
  return db().prepare("SELECT id, email, name, password_hash FROM users WHERE email = ?").get(email) as
    | { id: string; email: string; name: string; password_hash: string }
    | undefined;
}

export function defaultWorkspaceFor(userId: string): string | undefined {
  const row = db()
    .prepare("SELECT workspace_id FROM memberships WHERE user_id = ? ORDER BY rowid LIMIT 1")
    .get(userId) as { workspace_id: string } | undefined;
  return row?.workspace_id;
}

// ---------- Sessions (cookie) ----------

export async function startSession(userId: string, workspaceId: string) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  db()
    .prepare("INSERT INTO sessions (token_hash, user_id, workspace_id, expires_at) VALUES (?, ?, ?, ?)")
    .run(sha256(token), userId, workspaceId, expires.toISOString());
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) db().prepare("DELETE FROM sessions WHERE token_hash = ?").run(sha256(token));
  jar.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = db()
    .prepare(
      `SELECT s.user_id, s.workspace_id, s.expires_at, u.email, u.name, w.name AS workspace_name
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       JOIN workspaces w ON w.id = s.workspace_id
       JOIN memberships m ON m.user_id = s.user_id AND m.workspace_id = s.workspace_id
       WHERE s.token_hash = ?`,
    )
    .get(sha256(token)) as
    | { user_id: string; workspace_id: string; expires_at: string; email: string; name: string; workspace_name: string }
    | undefined;
  if (!row || new Date(row.expires_at) < new Date()) return null;
  return { userId: row.user_id, email: row.email, name: row.name, workspaceId: row.workspace_id, workspaceName: row.workspace_name };
}

// For pages and server actions: every data access is scoped to session.workspaceId.
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

// ---------- Workspace API keys (MCP + ingest) ----------

export function rotateApiKey(workspaceId: string): string {
  const key = `cs_${randomBytes(24).toString("base64url")}`;
  db()
    .prepare("UPDATE workspaces SET api_key_hash = ?, api_key_prefix = ? WHERE id = ?")
    .run(sha256(key), key.slice(0, 8), workspaceId);
  return key;
}

// Resolves "Authorization: Bearer cs_..." to a workspace, or an error response.
export function authenticateApiRequest(req: Request): { workspaceId: string } | Response {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) {
    return Response.json({ error: "Missing Authorization: Bearer <workspace API key>" }, { status: 401 });
  }
  const row = db().prepare("SELECT id FROM workspaces WHERE api_key_hash = ?").get(sha256(token)) as
    | { id: string }
    | undefined;
  return row ? { workspaceId: row.id } : Response.json({ error: "Invalid API key" }, { status: 401 });
}

// ---------- Simple fixed-window rate limit (per process) ----------

const attempts = new Map<string, { count: number; reset: number }>();

export function rateLimited(key: string, limit = 10, windowMs = 15 * 60_000): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.reset < now) {
    attempts.set(key, { count: 1, reset: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}
