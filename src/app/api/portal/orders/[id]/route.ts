import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/portal/session";
import {
  canAccessOrder,
  getOrderById,
  updateOrderStatus,
} from "@/lib/portal/orders-store";
import { ORDER_STATUS_LIST } from "@/types/portal";
import type { OrderStatus } from "@/types/portal";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const user = await getSessionFromCookies();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await Promise.resolve(params);
  const order = await getOrderById(id);
  if (!order || !canAccessOrder(user, order)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ order });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const user = await getSessionFromCookies();
  if (!user || user.role !== "employee") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const { id } = await Promise.resolve(params);
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const status = (body as Record<string, unknown>)?.status;
  if (typeof status !== "string" || !ORDER_STATUS_LIST.includes(status as OrderStatus)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const updated = await updateOrderStatus(id, status as OrderStatus);
  if (!updated) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ order: updated });
}
