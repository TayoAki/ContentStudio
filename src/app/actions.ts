"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireSession, rotateApiKey } from "@/lib/auth";
import { db } from "@/lib/db";
import { searchReels, syncCreators } from "@/lib/discovery";
import {
  IngestError,
  archiveFormat,
  deleteFormat,
  mergeFormats,
  createTrackedLink,
  recordPost,
  setFormatStatus as setFormatStatusFor,
  attachAsset,
  deleteAssetRow,
  planIdea,
  quickAddIdea,
  reorderColumn,
  saveVideoAsIdea,
  scheduleIdea,
  updateCreatorMeta,
  updateIdea,
  upsertIdea,
  upsertNiche,
} from "@/lib/ingest";
import { removeUpload } from "@/lib/uploads";
import { getFormat, getIdea, IDEA_STATUSES, type IdeaStatus } from "@/lib/queries";

// Every action re-checks the session and scopes writes to its workspace:
// server actions are public endpoints, so form input is never trusted for that.

const field = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

// Errors from ingest are user-facing; surface them via a short-lived cookie
// the page renders as a banner.
async function flash(message: string) {
  (await cookies()).set("cs_flash", message, { maxAge: 30, path: "/", httpOnly: true, sameSite: "lax" });
}

async function guarded(fn: () => Promise<void> | void) {
  try {
    await fn();
  } catch (err) {
    if (err instanceof IngestError) return flash(err.message);
    throw err;
  }
}

export async function createIdeaFromFormat(form: FormData) {
  const { workspaceId: ws } = await requireSession();
  const format = getFormat(ws, field(form, "format_id"));
  if (!format) return flash("Format not found");
  const ideaId = upsertIdea(ws, {
    format_id: format.id,
    title: `New: ${format.name}`,
    notes: `Structure:\n${format.structure.map((b) => `- ${b}`).join("\n")}`,
    status: "idea",
    created_by: "user",
  });
  redirect(`/recreate?idea=${ideaId}`);
}

export async function saveIdea(form: FormData) {
  const { workspaceId: ws } = await requireSession();
  const date = field(form, "scheduled_for");
  const planned = field(form, "planned_for");
  const status = field(form, "status") as IdeaStatus;
  await guarded(() => {
    updateIdea(ws, field(form, "id"), {
      title: field(form, "title") || undefined,
      hook: field(form, "hook"),
      script: field(form, "script"),
      notes: field(form, "notes"),
      platform: field(form, "platform") || undefined,
      status: IDEA_STATUSES.includes(status) ? status : undefined,
      // The date field only exists for Ready/Scheduled ideas; leave the date alone otherwise.
      scheduled_for: form.has("scheduled_for") ? (date ? new Date(`${date}T12:00:00`).toISOString() : null) : undefined,
      planned_for: form.has("planned_for") ? planned || null : undefined,
    });
  });
  revalidatePath("/recreate");
}

export async function moveIdea(form: FormData) {
  const { workspaceId: ws } = await requireSession();
  const status = field(form, "status") as IdeaStatus;
  if (!IDEA_STATUSES.includes(status)) return flash("Bad status");
  await guarded(() => void updateIdea(ws, field(form, "id"), { status }));
  revalidatePath("/recreate");
}

export async function markPosted(form: FormData) {
  const { workspaceId: ws } = await requireSession();
  const idea = getIdea(ws, field(form, "id"));
  if (!idea) return flash("Idea not found");
  const postId = recordPost(ws, { idea_id: idea.id, platform: idea.platform, url: field(form, "url"), caption: idea.title });
  redirect(`/track?post=${postId}`);
}

export async function setFormatStatus(form: FormData) {
  const { workspaceId: ws } = await requireSession();
  await guarded(() => setFormatStatusFor(ws, field(form, "id"), field(form, "status")));
  revalidatePath("/discover");
}

export async function createLink(form: FormData) {
  const { workspaceId: ws } = await requireSession();
  await guarded(() => {
    createTrackedLink(ws, {
      slug: field(form, "slug"),
      destination: field(form, "destination"),
      label: field(form, "label"),
      post_id: field(form, "post_id") || null,
      keyword: field(form, "keyword"),
    });
  });
  revalidatePath("/track");
}

// Archive / restore / delete / merge. Stay on Discover, on the formats tab.
function formatsPage(form: FormData, formatId?: string, opts: { archivedList?: boolean; niche?: string | null } = {}) {
  const q = new URLSearchParams({ tab: "formats" });
  const niche = opts.niche ?? field(form, "niche_id");
  if (niche) q.set("niche", niche);
  if (formatId) q.set("format", formatId);
  if (opts.archivedList ?? field(form, "show_archived") === "1") q.set("archived", "1");
  return `/discover?${q}`;
}

export async function archiveFormatAction(form: FormData) {
  const { workspaceId: ws } = await requireSession();
  const id = field(form, "id");
  const restore = field(form, "restore") === "1";
  await guarded(async () => {
    archiveFormat(ws, id, !restore);
    await flash(restore ? "Format restored." : "Format archived. Find it under Archived on the Winning formats tab.");
  });
  revalidatePath("/discover");
  // A restored format goes back to the Active list, opened.
  redirect(restore ? formatsPage(form, id, { archivedList: false }) : formatsPage(form));
}

export async function deleteFormatAction(form: FormData) {
  const { workspaceId: ws } = await requireSession();
  await guarded(async () => {
    deleteFormat(ws, field(form, "id"));
    await flash("Format deleted. Its videos and ideas were kept, without the format label.");
  });
  revalidatePath("/discover");
  revalidatePath("/recreate");
  redirect(formatsPage(form));
}

export async function mergeFormatAction(form: FormData) {
  const { workspaceId: ws } = await requireSession();
  const into = field(form, "into_id");
  let ok = false;
  await guarded(async () => {
    const r = mergeFormats(ws, field(form, "id"), into);
    const n = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;
    await flash(`Merged: moved ${n(r.moved_videos, "video")} and ${n(r.moved_ideas, "idea")}.`);
    ok = true;
  });
  revalidatePath("/discover");
  revalidatePath("/recreate");
  // The kept format may live in another niche; open it there.
  redirect(ok ? formatsPage(form, into, { archivedList: false, niche: getFormat(ws, into)?.niche_id }) : formatsPage(form, field(form, "id")));
}

// ---------- Discover ----------

export async function createNiche(form: FormData) {
  const { workspaceId: ws } = await requireSession();
  let nicheId = "";
  await guarded(() => {
    nicheId = upsertNiche(ws, { name: field(form, "name"), keywords: field(form, "keywords") });
  });
  if (nicheId) redirect(`/discover?niche=${nicheId}`);
}

export async function runReelSearch(form: FormData) {
  const { workspaceId: ws } = await requireSession();
  const nicheId = field(form, "niche_id") || null;
  await guarded(async () => {
    const { stored } = await searchReels(ws, field(form, "query"), nicheId);
    await flash(`Stored ${stored} reels. Sync promising creators to get follower counts.`);
  });
  revalidatePath("/discover");
}

export async function runCreatorSync(form: FormData) {
  const { workspaceId: ws } = await requireSession();
  const platform = field(form, "platform") === "tiktok" ? "tiktok" : "instagram";
  const handles = field(form, "handles").split(/[\s,]+/).filter(Boolean).slice(0, 10);
  if (handles.length === 0) return flash("Enter at least one handle");
  const results = await syncCreators(ws, platform, handles, field(form, "niche_id") || null);
  await flash(Object.entries(results).map(([h, r]) => `@${h}: ${typeof r === "number" ? `${r} posts` : r}`).join(" · "));
  revalidatePath("/discover");
}

// "Save to Ideas" from any video in Discover. Stays on the page so several
// videos can be saved in a row.
export async function saveVideoToIdeas(form: FormData) {
  const { workspaceId: ws } = await requireSession();
  await guarded(() => {
    saveVideoAsIdea(ws, field(form, "post_id"));
  });
  revalidatePath("/discover");
  revalidatePath("/recreate");
}

export async function updateAccount(form: FormData) {
  const { workspaceId: ws } = await requireSession();
  await guarded(() =>
    updateCreatorMeta(ws, field(form, "id"), {
      category: field(form, "category"),
      sells: field(form, "sells"),
      sells_url: field(form, "sells_url"),
    }),
  );
  revalidatePath("/discover");
}

// ---------- Board, calendar and assets (called from client components) ----------

const isIdList = (v: unknown): v is string[] =>
  Array.isArray(v) && v.length <= 500 && v.every((x) => typeof x === "string" && x.length < 64);

export async function reorderIdeas(status: string, ids: string[]): Promise<{ error?: string }> {
  const { workspaceId: ws } = await requireSession();
  if (typeof status !== "string" || !isIdList(ids)) return { error: "Bad request" };
  try {
    reorderColumn(ws, status, ids);
  } catch (err) {
    if (err instanceof IngestError) return { error: err.message };
    throw err;
  }
  revalidatePath("/recreate");
  return {};
}

export async function setIdeaDate(ideaId: string, when: string | null): Promise<{ error?: string }> {
  const { workspaceId: ws } = await requireSession();
  if (typeof ideaId !== "string" || (when !== null && typeof when !== "string")) return { error: "Bad request" };
  try {
    scheduleIdea(ws, ideaId, when);
  } catch (err) {
    if (err instanceof IngestError) return { error: err.message };
    throw err;
  }
  revalidatePath("/recreate");
  return {};
}

export async function setIdeaPlannedDate(ideaId: string, when: string | null): Promise<{ error?: string }> {
  const { workspaceId: ws } = await requireSession();
  if (typeof ideaId !== "string" || (when !== null && typeof when !== "string")) return { error: "Bad request" };
  try {
    planIdea(ws, ideaId, when);
  } catch (err) {
    if (err instanceof IngestError) return { error: err.message };
    throw err;
  }
  revalidatePath("/recreate");
  return {};
}

export async function quickAddIdeaAction(form: FormData) {
  const { workspaceId: ws } = await requireSession();
  await guarded(() => void quickAddIdea(ws, field(form, "title"), field(form, "status")));
  revalidatePath("/recreate");
}

export async function attachAssetAction(form: FormData) {
  const { workspaceId: ws } = await requireSession();
  await guarded(() => attachAsset(ws, field(form, "asset_id"), field(form, "idea_id") || null));
  revalidatePath("/recreate");
}

export async function deleteAssetAction(form: FormData) {
  const { workspaceId: ws } = await requireSession();
  const assetId = field(form, "asset_id");
  const row = deleteAssetRow(ws, assetId);
  if (row?.url.startsWith("/api/uploads/")) await removeUpload(ws, assetId);
  revalidatePath("/recreate");
}

// ---------- Settings ----------

export async function regenerateApiKey() {
  const { workspaceId: ws } = await requireSession();
  const key = rotateApiKey(ws);
  // Shown once on the settings page, never stored in plaintext.
  (await cookies()).set("cs_new_key", key, { maxAge: 120, path: "/settings", httpOnly: true, sameSite: "strict" });
  revalidatePath("/settings");
}

export async function saveStripeSecret(form: FormData) {
  const { workspaceId: ws } = await requireSession();
  const secret = field(form, "stripe_webhook_secret");
  if (secret && !secret.startsWith("whsec_")) return flash("Stripe signing secrets start with whsec_");
  db().prepare("UPDATE workspaces SET stripe_webhook_secret = ? WHERE id = ?").run(secret || null, ws);
  revalidatePath("/settings");
}

export async function renameWorkspace(form: FormData) {
  const { workspaceId: ws } = await requireSession();
  const name = field(form, "name");
  if (name) db().prepare("UPDATE workspaces SET name = ? WHERE id = ?").run(name, ws);
  revalidatePath("/settings");
}
