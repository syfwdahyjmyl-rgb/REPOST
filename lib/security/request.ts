/** Lightweight same-origin guard for state-changing local API requests. */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // CLI/local automation has no Origin header.
  try {
    return origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export function originError(): Response {
  return Response.json({ error: "cross_origin_request_blocked" }, { status: 403 });
}
