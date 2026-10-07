import { cookies } from "next/headers";

// One-off message set by a server action (see flash() in app/actions.ts).
export async function Flash() {
  const message = (await cookies()).get("cs_flash")?.value;
  if (!message) return null;
  return <div className="mb-4 rounded-lg border border-line bg-accent-soft px-4 py-2 text-sm text-accent">{message}</div>;
}
