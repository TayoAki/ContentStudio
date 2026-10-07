"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { recordPost, upsertIdea } from "@/lib/ingest";
import { getFormat, getIdea, IDEA_STATUSES, type IdeaStatus } from "@/lib/queries";

const field = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

export async function createIdeaFromFormat(form: FormData) {
  const format = getFormat(field(form, "format_id"));
  if (!format) throw new Error("Format not found");
  const ideaId = upsertIdea({
    format_id: format.id,
    title: `New: ${format.name}`,
    notes: `Structure:\n${format.structure.map((b) => `- ${b}`).join("\n")}`,
    status: "idea",
    created_by: "user",
  });
  redirect(`/recreate?idea=${ideaId}`);
}

export async function saveIdea(form: FormData) {
  const existing = getIdea(field(form, "id"));
  if (!existing) throw new Error("Idea not found");
  const date = field(form, "scheduled_for");
  const status = field(form, "status") as IdeaStatus;
  upsertIdea({
    ...existing,
    title: field(form, "title") || existing.title,
    hook: field(form, "hook"),
    script: field(form, "script"),
    notes: field(form, "notes"),
    platform: field(form, "platform") || existing.platform,
    status: IDEA_STATUSES.includes(status) ? status : existing.status,
    scheduled_for: date ? new Date(`${date}T12:00:00`).toISOString() : null,
  });
  revalidatePath("/recreate");
}

export async function moveIdea(form: FormData) {
  const status = field(form, "status") as IdeaStatus;
  if (!IDEA_STATUSES.includes(status)) throw new Error("Bad status");
  db()
    .prepare("UPDATE ideas SET status = ?, updated_at = datetime('now') WHERE id = ?")
    .run(status, field(form, "id"));
  revalidatePath("/recreate");
}

export async function markPosted(form: FormData) {
  const idea = getIdea(field(form, "id"));
  if (!idea) throw new Error("Idea not found");
  const postId = recordPost({
    idea_id: idea.id,
    platform: idea.platform,
    url: field(form, "url"),
    caption: idea.title,
  });
  redirect(`/track?post=${postId}`);
}

export async function setFormatStatus(form: FormData) {
  db().prepare("UPDATE formats SET status = ? WHERE id = ?").run(field(form, "status"), field(form, "id"));
  revalidatePath("/discover");
}

export async function createLink(form: FormData) {
  const slug = field(form, "slug").toLowerCase().replace(/[^a-z0-9-]/g, "");
  const destination = field(form, "destination");
  if (!slug || !URL.canParse(destination)) throw new Error("Slug and a valid destination URL are required");
  const postId = field(form, "post_id") || null;
  db()
    .prepare("INSERT OR REPLACE INTO links (slug, destination, label, post_id) VALUES (?, ?, ?, ?)")
    .run(slug, destination, field(form, "label"), postId);
  const keyword = field(form, "keyword").toUpperCase();
  if (keyword) {
    db()
      .prepare("INSERT OR REPLACE INTO keywords (keyword, post_id, link_slug) VALUES (?, ?, ?)")
      .run(keyword, postId, slug);
  }
  revalidatePath("/track");
}
