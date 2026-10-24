import { NextResponse } from "next/server";
import { authorizationUrl, isOAuthConfigured, issueState } from "@/lib/auth/oauth";
export const dynamic = "force-dynamic";
export async function GET() { if (!isOAuthConfigured()) return NextResponse.json({ enabled: false, code: "REAL_INTEGRATION_DISABLED" }, { status: 503 }); const state = await issueState(); const url = state && authorizationUrl(state); return url ? NextResponse.redirect(url) : NextResponse.json({ enabled: false, code: "REAL_INTEGRATION_DISABLED" }, { status: 503 }); }
