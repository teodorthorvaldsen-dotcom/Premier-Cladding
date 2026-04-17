import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

const MAX_BYTES = 15 * 1024 * 1024;

function isPdfFile(f: File): boolean {
  if (!f || f.size === 0) return false;
  if (f.size > MAX_BYTES) return false;
  const name = f.name.toLowerCase();
  return f.type === "application/pdf" || name.endsWith(".pdf");
}

function isValidDateValue(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const t = Date.parse(`${s}T12:00:00`);
  return !Number.isNaN(t);
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
  if (!orderId) {
    return NextResponse.json({ error: "Order ID required" }, { status: 400 });
  }

  const gl = form.get("generalLiability");
  const glExp = String(form.get("generalLiabilityExpiry") ?? "").trim();
  const wc = form.get("workersComp");
  const wcExp = String(form.get("workersCompExpiry") ?? "").trim();
  const bl = form.get("businessLicense");

  if (!(gl instanceof File) || !isPdfFile(gl)) {
    return NextResponse.json(
      { error: "General liability: a PDF file under 15 MB is required." },
      { status: 400 }
    );
  }
  if (!isValidDateValue(glExp)) {
    return NextResponse.json(
      { error: "General liability: a valid expiration date is required." },
      { status: 400 }
    );
  }

  if (!(wc instanceof File) || !isPdfFile(wc)) {
    return NextResponse.json(
      { error: "Workers comp: a PDF file under 15 MB is required." },
      { status: 400 }
    );
  }
  if (!isValidDateValue(wcExp)) {
    return NextResponse.json(
      { error: "Workers comp: a valid expiration date is required." },
      { status: 400 }
    );
  }

  if (!(bl instanceof File) || !isPdfFile(bl)) {
    return NextResponse.json(
      { error: "Business license: a PDF file under 15 MB is required." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    orderId,
    received: {
      generalLiability: { filename: gl.name, expiry: glExp },
      workersComp: { filename: wc.name, expiry: wcExp },
      businessLicense: { filename: bl.name },
    },
  });
}
