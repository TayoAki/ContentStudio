"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Sparkles } from "lucide-react";
import type { AuthState } from "@/app/(auth)/actions";

const input = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm";

export function AuthForm({
  mode,
  action,
  next,
  demo,
}: {
  mode: "login" | "signup";
  action: (state: AuthState, form: FormData) => Promise<AuthState>;
  next?: string;
  demo?: { email: string; password: string };
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const signup = mode === "signup";
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-lg bg-accent text-white">
            <Sparkles size={18} />
          </span>
          <span className="text-lg font-semibold">ContentStudio</span>
        </div>
        <div className="rounded-xl border border-line bg-surface p-6">
          <h1 className="text-xl font-semibold">{signup ? "Create your studio" : "Log in"}</h1>
          <p className="mt-1 text-sm text-muted">
            {signup ? "Find winning formats in your niche, recreate them, track what converts." : "Welcome back."}
          </p>
          <form action={formAction} className="mt-5 space-y-3">
            {next && <input type="hidden" name="next" value={next} />}
            {signup && (
              <>
                <label className="block text-xs text-muted">
                  Your name
                  <input name="name" autoComplete="name" className={input} />
                </label>
                <label className="block text-xs text-muted">
                  Workspace / brand name
                  <input name="workspace" placeholder="e.g. Dre Style Co." className={input} />
                </label>
              </>
            )}
            <label className="block text-xs text-muted">
              Email
              <input name="email" type="email" required autoComplete="email" defaultValue={state.email ?? demo?.email} className={input} />
            </label>
            <label className="block text-xs text-muted">
              Password
              <input
                name="password"
                type="password"
                required
                minLength={signup ? 8 : undefined}
                autoComplete={signup ? "new-password" : "current-password"}
                defaultValue={demo?.password}
                className={input}
              />
            </label>
            {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
            <button disabled={pending} className="w-full rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white disabled:opacity-60">
              {pending ? "…" : signup ? "Create account" : "Log in"}
            </button>
          </form>
          {demo && !signup && <p className="mt-3 text-center text-xs text-muted">Local dev: demo credentials are pre-filled.</p>}
        </div>
        <p className="mt-4 text-center text-sm text-muted">
          {signup ? (
            <>Already have an account? <Link href="/login" className="text-accent underline">Log in</Link></>
          ) : (
            <>New here? <Link href="/signup" className="text-accent underline">Create an account</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
