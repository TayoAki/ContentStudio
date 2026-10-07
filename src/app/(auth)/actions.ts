"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  createUserWithWorkspace,
  defaultWorkspaceFor,
  endSession,
  findUserByEmail,
  rateLimited,
  startSession,
  verifyPassword,
} from "@/lib/auth";

export type AuthState = { error?: string; email?: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeNext(next: FormDataEntryValue | null): string {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") ? n : "/discover";
}

async function clientIp() {
  return (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

export async function signup(_: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const name = String(form.get("name") ?? "").trim();
  const workspace = String(form.get("workspace") ?? "").trim() || (name ? `${name}'s studio` : "My studio");

  if (rateLimited(`signup:${await clientIp()}`, 5, 60 * 60_000)) return { error: "Too many sign-ups from this network. Try later.", email };
  if (!EMAIL.test(email)) return { error: "Enter a valid email.", email };
  if (password.length < 8) return { error: "Password must be at least 8 characters.", email };
  if (findUserByEmail(email)) return { error: "An account with that email already exists. Log in instead.", email };

  const { userId, workspaceId } = await createUserWithWorkspace(email, password, name, workspace);
  await startSession(userId, workspaceId);
  redirect("/discover?welcome=1");
}

export async function login(_: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  if (rateLimited(`login:${email}`) || rateLimited(`login-ip:${await clientIp()}`, 30)) {
    return { error: "Too many attempts. Wait 15 minutes and try again.", email };
  }
  const user = findUserByEmail(email);
  // Same message either way so the form doesn't reveal which emails exist.
  if (!user || !(await verifyPassword(password, user.password_hash))) return { error: "Wrong email or password.", email };
  const workspaceId = defaultWorkspaceFor(user.id);
  if (!workspaceId) return { error: "This account has no workspace.", email };

  await startSession(user.id, workspaceId);
  redirect(safeNext(form.get("next")));
}

export async function logout() {
  await endSession();
  redirect("/login");
}
