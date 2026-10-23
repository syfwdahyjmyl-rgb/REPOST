import { NextResponse } from "next/server";
import { isOAuthConfigured, readSession } from "@/lib/auth/oauth";

export const dynamic = "force-dynamic";

/** Returns non-secret connection metadata; access and refresh tokens never leave the server. */
export async function GET() {
  const session = await readSession();
  return NextResponse.json({
    configured: isOAuthConfigured(),
    connected: Boolean(session),
    openId: session?.openId ?? null,
    capabilities: { canListReposts: false, canRemoveReposts: false, canBatchRemove: false },
  });
}
