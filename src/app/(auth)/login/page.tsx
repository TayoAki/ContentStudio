import { connection } from "next/server";
import { AuthForm } from "@/components/auth-form";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/seed";
import { db } from "@/lib/db";
import { login } from "../actions";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  await connection();
  const { next } = await searchParams;
  const hasDemo = !!db().prepare("SELECT 1 FROM users WHERE email = ?").get(DEMO_EMAIL);
  return (
    <AuthForm
      mode="login"
      action={login}
      next={typeof next === "string" ? next : undefined}
      demo={hasDemo && process.env.NODE_ENV !== "production" ? { email: DEMO_EMAIL, password: DEMO_PASSWORD } : undefined}
    />
  );
}
