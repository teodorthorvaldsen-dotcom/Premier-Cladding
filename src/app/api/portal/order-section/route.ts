import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getDemoOrderById } from "@/lib/demoData";
import { isPortalOrderSection } from "@/lib/portalOrderSection";
import { loadDynamicOrders, savePortalOrderSection } from "@/lib/portalPersistence";

export const runtime = "nodejs";

function orderExists(orderId: string): boolean {
  return !!(getDemoOrderById(orderId) || loadDynamicOrders().some((o) => o.id === orderId));
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "admin" && user.role !== "subcontractor")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const orderId =
    typeof body === "object" && body && "orderId" in body ? String((body as { orderId: unknown }).orderId ?? "").trim() : "";
  const sectionRaw =
    typeof body === "object" && body && "section" in body ? String((body as { section: unknown }).section ?? "").trim() : "";

  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }
  if (!orderExists(orderId)) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (!isPortalOrderSection(sectionRaw)) {
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }

  const section = sectionRaw;
  try {
    savePortalOrderSection(orderId, section);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to persist section.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, orderId, section });
}
