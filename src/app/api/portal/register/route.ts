import { NextRequest, NextResponse } from "next/server";
import { registerCustomer } from "@/lib/portal/accounts";
import {
  createSessionToken,
  PORTAL_SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/portal/session";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const o = body as Record<string, unknown>;
  const email = typeof o.email === "string" ? o.email : "";
  const password = typeof o.password === "string" ? o.password : "";

  const created = await registerCustomer(email, password);
  if (!created.ok) {
    return NextResponse.json({ error: created.error }, { status: 400 });
  }

  const norm = email.trim().toLowerCase();
  let token: string;
  try {
    token = createSessionToken({ email: norm, role: "customer" });
  } catch {
    return NextResponse.json(
      {
        error:
          "Portal is not configured. Add PORTAL_SESSION_SECRET (16+ characters) to the server environment.",
      },
      { status: 503 }
    );
  }

  const res = NextResponse.json({ ok: true, user: { email: norm, role: "customer" as const } });
  res.cookies.set(PORTAL_SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
