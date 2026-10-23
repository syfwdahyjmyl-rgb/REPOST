import { completeManualRemoval } from "../../../lib/manual-workflow";
import { localRepostStore } from "../../../lib/persistence";
import { isSameOrigin, originError } from "../../../lib/security/request";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return originError();
  let body: { repostId?: string; confirmed?: boolean; confirmedAt?: string; evidence?: string };
  try { body = await request.json(); } catch { return Response.json({ error: "Expected a JSON body." }, { status: 400 }); }
  if (!body.repostId) return Response.json({ error: "repostId is required." }, { status: 400 });
  const record = await localRepostStore.get(body.repostId);
  if (!record) return Response.json({ error: "Repost not found." }, { status: 404 });
  const result = completeManualRemoval(record, { repostId: body.repostId, confirmed: body.confirmed === true, confirmedAt: body.confirmedAt, evidence: body.evidence });
  if (!result.ok) return Response.json({ error: result.message, code: result.code }, { status: 422 });
  await localRepostStore.update(record.id, result.record);
  return Response.json({ record: result.record });
}
