import { completeManualRemoval, markRemovalRequested, validateRepostId } from "../../../../lib/manual-workflow";
import { localRepostStore } from "../../../../lib/persistence";
import { demoProvider } from "../../../../lib/providers/demo";
import { isSameOrigin, originError } from "../../../../lib/security/request";

export const runtime = "nodejs";

function json(data: unknown, init?: ResponseInit): Response { return Response.json(data, init); }

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const params = await context.params;
  let id: string;
  try { id = decodeURIComponent(params.id); } catch { return json({ error: "Invalid repost id." }, { status: 400 }); }
  if (!validateRepostId(id)) return json({ error: "Invalid repost id." }, { status: 400 });
  const record = await localRepostStore.get(id);
  return record ? json({ record }) : json({ error: "Repost not found." }, { status: 404 });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  if (!isSameOrigin(request)) return originError();
  const params = await context.params;
  let id: string;
  try { id = decodeURIComponent(params.id); } catch { return json({ error: "Invalid repost id." }, { status: 400 }); }
  if (!validateRepostId(id)) return json({ error: "Invalid repost id." }, { status: 400 });
  const record = await localRepostStore.get(id);
  if (!record) return json({ error: "Repost not found." }, { status: 404 });
  let body: { action?: string; confirmed?: boolean; confirmedAt?: string; evidence?: string } = {};
  try { body = await request.json(); } catch { return json({ error: "Expected a JSON body." }, { status: 400 }); }

  if (body.action === "request-removal") {
    const result = await demoProvider.requestRemoval(id);
    if (result.status === "manual_required") {
      const next = { ...record, status: "manual_required" as const, updatedAt: new Date().toISOString() };
      await localRepostStore.update(id, next);
      return json({ record: next, provider: result }, { status: 202 });
    }
    if (result.status === "accepted") {
      const next = markRemovalRequested(record);
      if (!("id" in next)) return json({ error: next.message }, { status: 409 });
      await localRepostStore.update(id, next);
      return json({ record: next, provider: result }, { status: 202 });
    }
    // A verified provider result is accepted only when it supplies a timestamp.
    const next = { ...record, status: "removed" as const, updatedAt: new Date().toISOString(), verification: { method: "provider" as const, verifiedAt: result.verifiedAt } };
    await localRepostStore.update(id, next);
    return json({ record: next, provider: result });
  }

  if (body.action === "complete-manual") {
    const result = completeManualRemoval(record, { repostId: id, confirmed: body.confirmed === true, confirmedAt: body.confirmedAt, evidence: body.evidence });
    if (!result.ok) return json({ error: result.message, code: result.code }, { status: 422 });
    await localRepostStore.update(id, result.record);
    return json({ record: result.record });
  }
  return json({ error: "Unknown action. Use request-removal or complete-manual." }, { status: 400 });
}

/** Deletion is intentionally unavailable: reposts must never be silently discarded. */
export async function DELETE(): Promise<Response> {
  return json({ error: "Deletion is unavailable. Repost records are retained for auditability." }, { status: 405, headers: { Allow: "GET, POST" } });
}
