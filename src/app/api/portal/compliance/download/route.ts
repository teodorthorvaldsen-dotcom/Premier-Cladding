import { existsSync, readFileSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { join, relative, resolve } from "path";
import { getSessionUser } from "@/lib/auth";
import { getPortalOrdersForUser } from "@/lib/portalOrders";
import { complianceUploadDirForSubmission, loadComplianceSubmissions } from "@/lib/portalPersistence";
import type { ComplianceDocSlot } from "@/lib/portalPersistence";

export const runtime = "nodejs";

const SLOTS: readonly ComplianceDocSlot[] = ["generalLiability", "workersComp", "businessLicense"];

const ALLOWED_DISK_NAMES = new Set(["general-liability.pdf", "workers-comp.pdf", "business-license.pdf"]);

/** Node `randomUUID()` v4 shape (also used for submission folders). */
const SUBMISSION_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function canAccess(user: NonNullable<Awaited<ReturnType<typeof getSessionUser>>>): boolean {
  return user.role === "subcontractor" || user.role === "admin";
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !canAccess(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const submissionId = req.nextUrl.searchParams.get("submissionId")?.trim() ?? "";
  const slot = req.nextUrl.searchParams.get("slot")?.trim() ?? "";
  if (!SUBMISSION_ID_RE.test(submissionId) || !SLOTS.includes(slot as ComplianceDocSlot)) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const docSlot = slot as ComplianceDocSlot;

  const allowed = new Set(getPortalOrdersForUser(user).map((o) => o.id));
  const submissions = loadComplianceSubmissions();
  const sub = submissions.find((s) => s.id === submissionId);
  if (!sub || !allowed.has(sub.orderId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const meta = sub.files.find((f) => f.slot === docSlot);
  if (!meta || !ALLOWED_DISK_NAMES.has(meta.storedFileName)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const base = complianceUploadDirForSubmission(submissionId);
  const fullPath = join(base, meta.storedFileName);
  const resolvedFile = resolve(fullPath);
  const resolvedBase = resolve(base);
  const rel = relative(resolvedBase, resolvedFile);
  if (rel.startsWith("..") || !existsSync(resolvedFile)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const safeBase = meta.originalName.replace(/[^\w.\- ()[\]]+/g, "_").slice(0, 120) || "document.pdf";
  const downloadName = safeBase.toLowerCase().endsWith(".pdf") ? safeBase : `${safeBase}.pdf`;

  const buf = readFileSync(resolvedFile);
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${downloadName.replace(/"/g, "")}"`,
    },
  });
}
