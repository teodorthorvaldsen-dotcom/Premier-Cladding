import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true });

  const forwardedProto = req.headers.get("x-forwarded-proto");
  const secureCookie =
    forwardedProto != null
      ? forwardedProto.split(",")[0].trim() === "https"
      : req.nextUrl.protocol === "https:";

  response.cookies.set("portal_token", "", {
    httpOnly: true,
    secure: secureCookie,
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  });

  return response;
}
