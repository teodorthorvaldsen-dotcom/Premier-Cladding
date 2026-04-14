import { writeFile, mkdir, appendFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const CONSULTATIONS_JSONL_PATH = path.join(process.cwd(), "data", "consultations.jsonl");

const MAX_FILES = 5;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const ORDER_COPY_EMAIL = "premiercladdingsolutions@gmail.com";

interface ConsultationPayload {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  projectCity: string;
  projectState: string;
  desiredTimeline: string;
  requestType: string;
  notes: string;
  uploadedFilenames?: string[];
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildBusinessEmailHtml(payload: ConsultationPayload): string {
  const typeLabel = REQUEST_TYPE_LABELS[payload.requestType] ?? payload.requestType;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
  <h2 style="margin-bottom: 0.5em;">New Consultation Request</h2>
  <p style="color: #666; margin-bottom: 1.5em;">New cladding consultation request.</p>

  <h3 style="margin-bottom: 0.5em; font-size: 1em;">Contact & Project</h3>
  <table style="border-collapse: collapse; margin-bottom: 1.5em;">
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Name</td><td>${escapeHtml(payload.fullName)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Company</td><td>${escapeHtml(payload.company)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Email</td><td><a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a></td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Phone</td><td>${escapeHtml(payload.phone)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Project</td><td>${escapeHtml(payload.projectCity)}, ${escapeHtml(payload.projectState)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Timeline</td><td>${escapeHtml(payload.desiredTimeline)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Request type</td><td>${escapeHtml(typeLabel)}</td></tr>
    ${payload.notes ? `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Notes</td><td>${escapeHtml(payload.notes)}</td></tr>` : ""}
    ${payload.uploadedFilenames?.length ? `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Uploaded files</td><td>${payload.uploadedFilenames.map((f) => escapeHtml(f)).join(", ")}</td></tr>` : ""}
  </table>

  <p style="color: #666; font-size: 0.9em;">Submitted via Cladding Solutions Consultation.</p>
</body>
</html>
`;
}

function buildCustomerEmailHtml(payload: ConsultationPayload): string {
  const typeLabel = REQUEST_TYPE_LABELS[payload.requestType] ?? payload.requestType;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
  <h2 style="margin-bottom: 0.5em;">Consultation Request Received</h2>
  <p>Dear ${escapeHtml(payload.fullName)},</p>
  <p>Thank you for your consultation request. We have received your submission. Our team of general contractors and structural engineers will review it and respond in 1–3 business days.</p>

  <p><strong>Request type:</strong> ${escapeHtml(typeLabel)}</p>
  ${payload.uploadedFilenames?.length ? `<p><strong>Files received:</strong> ${payload.uploadedFilenames.map((f) => escapeHtml(f)).join(", ")}</p>` : ""}
  <p style="color: #666; font-size: 0.9em;">— Cladding Solutions</p>
</body>
</html>
`;
}

const REQUEST_TYPE_LABELS: Record<string, string> = {
  "design-review": "Design review & panel specification",
  "takeoff": "Takeoff & quantity estimate",
  "technical": "Technical / detailing support",
  "other": "Other consultation",
};

function validatePayload(body: unknown): body is ConsultationPayload {
  if (!body || typeof body !== "object") return false;
  const o = body as Record<string, unknown>;
  return (
    typeof o.fullName === "string" &&
    typeof o.email === "string" &&
    o.email.includes("@") &&
    typeof o.requestType === "string" &&
    o.requestType.length > 0
  );
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
}

const UPLOAD_DIR = path.join(process.cwd(), "tmp", "consultation-uploads");

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Content-Type must be multipart/form-data." }, { status: 400 });
    }

    const formData = await request.formData();
    const payloadStr = formData.get("payload");
    if (typeof payloadStr !== "string") {
      return NextResponse.json({ error: "Invalid request. Missing payload." }, { status: 400 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(payloadStr);
    } catch {
      return NextResponse.json({ error: "Invalid payload JSON." }, { status: 400 });
    }

    if (!validatePayload(parsed)) {
      return NextResponse.json(
        { error: "Invalid request. Required: fullName, email, requestType." },
        { status: 400 }
      );
    }

    const payload: ConsultationPayload = {
      fullName: parsed.fullName,
      company: parsed.company ?? "",
      email: parsed.email,
      phone: parsed.phone ?? "",
      projectCity: parsed.projectCity ?? "",
      projectState: parsed.projectState ?? "",
      desiredTimeline: parsed.desiredTimeline ?? "",
      requestType: parsed.requestType,
      notes: parsed.notes ?? "",
    };

    const files = formData.getAll("files").filter((v): v is File => v instanceof File);
    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Maximum ${MAX_FILES} files allowed.` }, { status: 400 });
    }

    const uploadDir = UPLOAD_DIR;
    await mkdir(uploadDir, { recursive: true });

    const prefix = `${Date.now()}-`;
    const uploadedFilenames: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.name}. Use PDF, PNG, or JPG.` },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Max 10MB per file.` },
          { status: 400 }
        );
      }
      const safeName = sanitizeFilename(file.name);
      const storedName = `${prefix}${safeName}`;
      const filePath = path.join(uploadDir, storedName);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);
      uploadedFilenames.push(file.name);
    }

    payload.uploadedFilenames = uploadedFilenames;

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM;

    if (apiKey && fromEmail) {
      const businessRecipients = Array.from(
        new Set([process.env.BUSINESS_EMAIL, ORDER_COPY_EMAIL].filter(Boolean))
      ) as string[];

      const resend = new Resend(apiKey);
      const [businessResult, customerResult] = await Promise.all([
        resend.emails.send({
          from: fromEmail,
          to: businessRecipients,
          subject: `Consultation: ${payload.fullName} – ${REQUEST_TYPE_LABELS[payload.requestType] ?? payload.requestType}`,
          html: buildBusinessEmailHtml(payload),
        }),
        resend.emails.send({
          from: fromEmail,
          to: payload.email,
          subject: "Consultation Request Received – Cladding Solutions",
          html: buildCustomerEmailHtml(payload),
        }),
      ]);

      if (businessResult.error || customerResult.error) {
        const err = businessResult.error ?? customerResult.error;
        console.error("[Consultation email error]", err);
      }
    } else {
      console.log("[Consultation] Email not configured. Payload:", payload);
    }

    const record = {
      at: new Date().toISOString(),
      ...payload,
    };
    const dataDir = path.dirname(CONSULTATIONS_JSONL_PATH);
    await mkdir(dataDir, { recursive: true });
    await appendFile(CONSULTATIONS_JSONL_PATH, JSON.stringify(record) + "\n");

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Consultation API error]", e);
    return NextResponse.json(
      { error: "Invalid request or server error." },
      { status: 400 }
    );
  }
}
