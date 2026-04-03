import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getPortalOrdersForUser } from "@/lib/portalOrders";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ orders: getPortalOrdersForUser(user) });
}
