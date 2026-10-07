import { authenticateApiRequest, getSession } from "@/lib/auth";
import { id } from "@/lib/db";
import { IngestError, addUploadedAsset } from "@/lib/ingest";
import { ALLOWED_MIME, MAX_UPLOAD_BYTES, UploadTooLarge, removeUpload, writeUpload } from "@/lib/uploads";

// PUT /api/uploads?filename=look.mp4&idea_id=idea_x with the raw file as the
// body and its type as Content-Type. Works from the browser (session cookie)
// and from Claude Code / scripts (Authorization: Bearer <workspace API key>).
export async function PUT(req: Request) {
  let ws: string;
  if (req.headers.get("authorization")) {
    const auth = authenticateApiRequest(req);
    if (auth instanceof Response) return auth;
    ws = auth.workspaceId;
  } else {
    const session = await getSession();
    if (!session) return Response.json({ error: "Not signed in" }, { status: 401 });
    ws = session.workspaceId;
  }

  const mime = (req.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  const kind = ALLOWED_MIME[mime];
  if (!kind) return Response.json({ error: `Unsupported file type "${mime || "unknown"}". Use JPG, PNG, WebP, GIF, AVIF, MP4, MOV or WebM.` }, { status: 415 });
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_UPLOAD_BYTES) return Response.json({ error: `File is larger than ${MAX_UPLOAD_BYTES / 1024 / 1024} MB` }, { status: 413 });
  if (!req.body) return Response.json({ error: "Empty body" }, { status: 400 });

  const params = new URL(req.url).searchParams;
  const assetId = id("as");
  try {
    const size = await writeUpload(ws, assetId, req.body);
    addUploadedAsset(ws, {
      id: assetId,
      ideaId: params.get("idea_id") || null,
      kind,
      mime,
      size,
      filename: params.get("filename") || `${kind}-${assetId}`,
      createdBy: req.headers.get("authorization") ? "claude" : "user",
    });
    return Response.json({ ok: true, id: assetId, url: `/api/uploads/${assetId}`, kind, size });
  } catch (err) {
    await removeUpload(ws, assetId);
    if (err instanceof UploadTooLarge) return Response.json({ error: err.message }, { status: 413 });
    if (err instanceof IngestError) return Response.json({ error: err.message }, { status: 400 });
    throw err;
  }
}
