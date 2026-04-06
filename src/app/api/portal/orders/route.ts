import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getPortalOrdersForUser } from "@/lib/portalOrders";

export const runtime = "nodejs";

/**
 * Session orders for client UI (login page staff panel, etc.).
 */
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ orders: null }, { status: 401 });
  }
  const orders = getPortalOrdersForUser(user);
  return NextResponse.json({
    orders: orders.map((o) => ({
      id: o.id,
      projectName: o.projectName,
      customerName: o.customerName,
      status: o.status,
      jobStage: o.jobStage,
      createdAt: o.createdAt,
    })),
  });
}
