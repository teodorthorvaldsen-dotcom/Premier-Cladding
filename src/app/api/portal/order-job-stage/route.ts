import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getDemoOrderById } from "@/lib/demoData";
import { JOB_STAGE_PROGRESS_PCT, JOB_STAGES, type JobStage } from "@/lib/jobStage";
import { loadDynamicOrders, saveJobStageForOrder } from "@/lib/portalPersistence";

export const runtime = "nodejs";

function orderExists(orderId: string): boolean {
  return !!(getDemoOrderById(orderId) || loadDynamicOrders().some((o) => o.id === orderId));
}

function isJobStage(s: string): s is JobStage {
  return (JOB_STAGES as readonly string[]).includes(s);
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

  const orderId = typeof body === "object" && body && "orderId" in body ? String((body as { orderId: unknown }).orderId ?? "").trim() : "";
  const stageRaw = typeof body === "object" && body && "stage" in body ? String((body as { stage: unknown }).stage ?? "").trim() : "";

  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }
  if (!orderExists(orderId)) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (!isJobStage(stageRaw)) {
    return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
  }

  saveJobStageForOrder(orderId, stageRaw);

  return NextResponse.json({
    ok: true,
    orderId,
    stage: stageRaw,
    progressPercent: JOB_STAGE_PROGRESS_PCT[stageRaw],
  });
}
