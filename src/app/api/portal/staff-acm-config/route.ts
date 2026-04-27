import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getPortalOrderById } from "@/lib/portalOrders";
import type { CartItem } from "@/types/cart";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "admin" && user.role !== "subcontractor")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const orderId = req.nextUrl.searchParams.get("orderId")?.trim() ?? "";
  const lineRaw = req.nextUrl.searchParams.get("line");
  const line = Math.max(0, parseInt(lineRaw ?? "0", 10) || 0);

  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  const order = getPortalOrderById(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const lines: CartItem[] =
    order.cartLineItems && order.cartLineItems.length > 0 ? order.cartLineItems : [order.lineItem];
  const idx = Math.min(line, Math.max(0, lines.length - 1));
  const lineItem = lines[idx]!;

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    projectName: order.projectName,
    lineIndex: idx,
    lineCount: lines.length,
    lineItem,
  });
}
