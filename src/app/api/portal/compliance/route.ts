import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { loadDynamicOrders } from "@/lib/portalPersistence";
import { getDemoOrderById } from "@/lib/demoData";

export const runtime = "nodejs";

const MAX_PDF_BYTES = 12 * 1024 * 1024;

function isPdfFile(f: File | null): boolean {
  if (!f || f.size === 0) return false;
  if (f.size > MAX_PDF_BYTES) return false;
  const type = f.type.toLowerCase();
  return type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
}

function orderExists(orderId: string): boolean {
  return !!(getDemoOrderById(orderId) || loadDynamicOrders().some((o) => o.id === orderId));
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "subcontractor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const orderId = String(form.get("orderId") ?? "").trim();
  if (!orderId || !orderExists(orderId)) {
    return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  }

  const gl = form.get("generalLiability");
  const wc = form.get("workersComp");
  const bl = form.get("businessLicense");
  const glFile = gl instanceof File ? gl : null;
  const wcFile = wc instanceof File ? wc : null;
  const blFile = bl instanceof File ? bl : null;

  if (!isPdfFile(glFile) || !isPdfFile(wcFile) || !isPdfFile(blFile)) {
    return NextResponse.json({ error: "Each upload must be a PDF under 12 MB." }, { status: 400 });
  }

  const glExp = String(form.get("generalLiabilityExpiry") ?? "").trim();
  const wcExp = String(form.get("workersCompExpiry") ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(glExp) || !/^\d{4}-\d{2}-\d{2}$/.test(wcExp)) {
    return NextResponse.json({ error: "Valid expiration dates are required." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
