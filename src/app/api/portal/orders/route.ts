import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/portal/session";
import { listOrdersForUser } from "@/lib/portal/orders-store";

export async function GET() {
  const user = await getSessionFromCookies();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  try {
    const orders = await listOrdersForUser(user);
    return NextResponse.json({ orders });
  } catch (e) {
    console.error("[portal/orders GET]", e);
    return NextResponse.json({ error: "Failed to load orders." }, { status: 500 });
  }
}
