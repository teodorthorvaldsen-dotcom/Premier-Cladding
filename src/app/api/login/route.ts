import { NextRequest, NextResponse } from "next/server";
import { authenticatePortalUser, signToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim();
    const password = String(body.password || "").trim();

    const user = await authenticatePortalUser(email, password);

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      ...(user.customerId ? { customerId: user.customerId } : {}),
    });

    const response = NextResponse.json({ success: true });

    // Secure cookies are dropped on http:// even when NODE_ENV is production (e.g. local `next start`).
    const forwardedProto = req.headers.get("x-forwarded-proto");
    const secureCookie =
      forwardedProto != null
        ? forwardedProto.split(",")[0].trim() === "https"
        : req.nextUrl.protocol === "https:";

    response.cookies.set("portal_token", token, {
      httpOnly: true,
      secure: secureCookie,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
