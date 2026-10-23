import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth/oauth";
import { isSameOrigin } from "@/lib/security/request";
export async function POST(request: Request) { if (!isSameOrigin(request)) return NextResponse.json({ error: "cross_origin_request_blocked" }, { status: 403 }); await clearSession(); return NextResponse.json({ ok: true }); }
