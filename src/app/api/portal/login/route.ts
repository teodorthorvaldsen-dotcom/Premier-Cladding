import { NextRequest, NextResponse } from "next/server";
import { authenticatePortalUser, signToken } from "@/lib/auth";

const COOKIE = "portal_token";
const MAX_AGE = 60 * 60 * 24 * 7;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const email = typeof (body as { email?: unknown }).email === "string" ? (body as { email: string }).email.trim() : "";
  const password =
    typeof (body as { password?: unknown }).password === "string" ? (body as { password: string }).password : "";
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const user = await authenticatePortalUser(email, password);
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
  if (user.role === "customer") {
    return NextResponse.json(
      { error: "The customer order portal is not available. Staff sign-in uses subcontractor or admin credentials." },
      { status: 403 }
    );
  }

  const token = signToken(user);
  const res = NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
