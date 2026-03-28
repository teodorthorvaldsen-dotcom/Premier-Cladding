import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/portal/session";

export async function GET() {
  const user = await getSessionFromCookies();
  return NextResponse.json({ user: user ?? null });
}
