import { randomUUID } from "crypto";
import { mkdirSync, writeFileSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getPortalOrderById, getPortalOrdersForUser } from "@/lib/portalOrders";
import {
  appendComplianceSubmission,
  complianceUploadDirForSubmission,
  loadComplianceSubmissions,
  loadDynamicOrders,
  type ComplianceDocSlot,
  type ComplianceSubmissionFileMeta,
  type ComplianceSubmissionRecord,
} from "@/lib/portalPersistence";
import { getDemoOrderById } from "@/lib/demoData";

export const runtime = "nodejs";

const MAX_PDF_BYTES = 12 * 1024 * 1024;

const DISK_NAMES: Record<ComplianceDocSlot, string> = {
  generalLiability: "general-liability.pdf",
  workersComp: "workers-comp.pdf",
  businessLicense: "business-license.pdf",
};

function isPdfFile(f: File | null): boolean {
  if (!f || f.size === 0) return false;
  if (f.size > MAX_PDF_BYTES) return false;
  const type = f.type.toLowerCase();
  return type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
}

function orderExists(orderId: string): boolean {
  return !!(getDemoOrderById(orderId) || loadDynamicOrders().some((o) => o.id === orderId));
}

function canAccessCompliance(user: NonNullable<Awaited<ReturnType<typeof getSessionUser>>>): boolean {
  return user.role === "subcontractor" || user.role === "admin";
}

export async function GET() {
  const user = await getSessionUser();
  if (!user || !canAccessCompliance(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const orders = getPortalOrdersForUser(user);
  const allowed = new Set(orders.map((o) => o.id));
  const submissions = loadComplianceSubmissions()
    .filter((s) => allowed.has(s.orderId))
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  return NextResponse.json({ submissions });
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

  const allowed = new Set(getPortalOrdersForUser(user).map((o) => o.id));
  if (!allowed.has(orderId)) {
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

  const submissionId = randomUUID();
  const dir = complianceUploadDirForSubmission(submissionId);
  mkdirSync(dir, { recursive: true });

  const glBuf = Buffer.from(await glFile.arrayBuffer());
  const wcBuf = Buffer.from(await wcFile.arrayBuffer());
  const blBuf = Buffer.from(await blFile.arrayBuffer());
  writeFileSync(`${dir}/${DISK_NAMES.generalLiability}`, glBuf);
  writeFileSync(`${dir}/${DISK_NAMES.workersComp}`, wcBuf);
  writeFileSync(`${dir}/${DISK_NAMES.businessLicense}`, blBuf);

  const order = getPortalOrderById(orderId);
  const companyName = order?.companyName?.trim() || "—";

  const files: ComplianceSubmissionFileMeta[] = [
    {
      slot: "generalLiability",
      storedFileName: DISK_NAMES.generalLiability,
      originalName: glFile.name || "general-liability.pdf",
      expiry: glExp,
    },
    {
      slot: "workersComp",
      storedFileName: DISK_NAMES.workersComp,
      originalName: wcFile.name || "workers-comp.pdf",
      expiry: wcExp,
    },
    {
      slot: "businessLicense",
      storedFileName: DISK_NAMES.businessLicense,
      originalName: blFile.name || "business-license.pdf",
    },
  ];

  const rec: ComplianceSubmissionRecord = {
    id: submissionId,
    orderId,
    companyName,
    subcontractorEmail: user.email,
    submittedAt: new Date().toISOString(),
    files,
  };
  appendComplianceSubmission(rec);

  return NextResponse.json({ ok: true, submissionId });
}
