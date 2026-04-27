import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getPortalOrdersForUser } from "@/lib/portalOrders";

export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== "admin" && user.role !== "subcontractor")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const orders = getPortalOrdersForUser(user);
  return NextResponse.json({
    orders: orders.map((o) => ({
      id: o.id,
      projectName: o.projectName,
      jobStage: o.jobStage ?? "ordering",
      createdAt: o.createdAt,
      lineCount: o.cartLineItems?.length ?? 1,
    })),
  });
}
