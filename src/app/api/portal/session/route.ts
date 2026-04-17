import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * Lightweight session peek for client UI (nav links). Authorization is enforced
 * on protected routes and APIs, not on this response alone.
 */
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: { role: user.role, name: user.name, email: user.email },
  });
}
