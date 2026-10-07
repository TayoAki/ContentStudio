import { authenticateApiRequest, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { serveFile, uploadPath } from "@/lib/uploads";

// Serves an uploaded file to members of its workspace, with Range support.
export async function GET(req: Request, ctx: RouteContext<"/api/uploads/[id]">) {
  let ws: string | undefined;
  if (req.headers.get("authorization")) {
    const auth = authenticateApiRequest(req);
    if (auth instanceof Response) return auth;
    ws = auth.workspaceId;
  } else {
    ws = (await getSession())?.workspaceId;
  }
  if (!ws) return new Response("Not signed in", { status: 401 });

  const { id } = await ctx.params;
  const row = db().prepare("SELECT mime, filename FROM assets WHERE id = ? AND workspace_id = ? AND mime IS NOT NULL").get(id, ws) as
    | { mime: string; filename: string | null }
    | undefined;
  if (!row) return new Response("Not found", { status: 404 });
  return serveFile(uploadPath(ws, id), row.mime, req.headers.get("range"), {
    "cache-control": "private, max-age=31536000, immutable",
    "content-disposition": `inline; filename="${(row.filename ?? id).replace(/["\\\r\n]/g, "")}"`,
  });
}
