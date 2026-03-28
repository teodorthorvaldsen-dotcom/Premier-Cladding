import { NextResponse } from "next/server";
import { PORTAL_SESSION_COOKIE, sessionCookieOptions } from "@/lib/portal/session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(PORTAL_SESSION_COOKIE, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  return res;
}
