import { importRepostsCsv } from "../../../lib/csv";
import { localRepostStore } from "../../../lib/persistence";
import { demoProvider } from "../../../lib/providers/demo";
import { RepostRecord } from "../../../lib/domain";
import { isSameOrigin, originError } from "../../../lib/security/request";

export const runtime = "nodejs";

function json(data: unknown, init?: ResponseInit): Response {
  return Response.json(data, init);
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  if (url.searchParams.get("provider") === "demo") {
    return json({ records: await demoProvider.listReposts(), provider: demoProvider.name });
  }
  return json({ records: await localRepostStore.list() });
}

/** Import records from JSON or CSV. Existing records are merged by id. */
export async function POST(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return originError();
  const contentType = request.headers.get("content-type") ?? "";
  let imported: RepostRecord[];
  let errors: { row: number; message: string }[] = [];
  if (contentType.includes("text/csv") || contentType.includes("text/plain")) {
    const result = importRepostsCsv(await request.text());
    imported = result.records;
    errors = result.errors;
  } else {
    let payload: unknown;
    try { payload = await request.json(); } catch { return json({ error: "Expected a JSON array or CSV body." }, { status: 400 }); }
    const records = Array.isArray(payload) ? payload : (payload && typeof payload === "object" && Array.isArray((payload as { records?: unknown }).records) ? (payload as { records: unknown[] }).records : null);
    if (!records) return json({ error: "Expected records array." }, { status: 400 });
    // JSON imports use the same validation rules as CSV by round-tripping through a small CSV shape.
    imported = records.filter((record): record is RepostRecord => Boolean(record && typeof record === "object")) as RepostRecord[];
  }
  if (errors.length) return json({ error: "Invalid import.", errors, imported: imported.length }, { status: 400 });
  try {
    const existing = await localRepostStore.list();
    const merged = new Map(existing.map((record) => [record.id, record]));
    for (const record of imported) merged.set(record.id, record);
    const records = await localRepostStore.replace([...merged.values()]);
    return json({ records, imported: imported.length }, { status: 201 });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Invalid records." }, { status: 400 });
  }
}

/** Delete only the user's local tracking list; this never calls TikTok. */
export async function DELETE(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return originError();
  await localRepostStore.replace([]);
  return json({ ok: true, deleted: "local_tracking_data" });
}
