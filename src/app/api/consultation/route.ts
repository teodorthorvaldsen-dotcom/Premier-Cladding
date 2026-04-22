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

function resendErrorMessage(e: unknown): string {
  if (e && typeof e === "object" && "message" in e && typeof (e as { message: unknown }).message === "string") {
    return (e as { message: string }).message;
  }
  return "Failed to send email.";
}

function truncateForEmail(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max)}\n\n…(truncated for email)`;
}

function buildBusinessEmailHtml(payload: ConsultationPayload): string {
  const typeLabel = REQUEST_TYPE_LABELS[payload.requestType] ?? payload.requestType;
  const notes = payload.notes ? truncateForEmail(payload.notes, 12_000) : "";
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
    ${notes ? `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Notes</td><td>${escapeHtml(notes)}</td></tr>` : ""}
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
  <h2 style="color: #1a1a1a;">Consultation Request Received</h2>
  <p>Dear ${escapeHtml(payload.fullName)},</p>
  <p>Thank you for reaching out to Cladding Solutions. We have received your request and our team will review it shortly.</p>

  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #444; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Order Summary</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 8px 0; color: #666; width: 120px;">Request Type:</td><td style="font-weight: 500;">${escapeHtml(typeLabel)}</td></tr>
      <tr><td style="padding: 8px 0; color: #666;">Project:</td><td>${escapeHtml(payload.projectCity)}, ${escapeHtml(payload.projectState)}</td></tr>
      <tr><td style="padding: 8px 0; color: #666;">Timeline:</td><td>${escapeHtml(payload.desiredTimeline)}</td></tr>
      ${payload.company ? `<tr><td style="padding: 8px 0; color: #666;">Company:</td><td>${escapeHtml(payload.company)}</td></tr>` : ""}
      ${payload.notes ? `<tr><td style="padding: 8px 0; color: #666; vertical-align: top;">Notes:</td><td style="white-space: pre-wrap;">${escapeHtml(payload.notes)}</td></tr>` : ""}
    </table>
  </div>

  <p>Our team of general contractors and structural engineers will respond to you within 1–3 business days.</p>
  
  <p style="margin-top: 30px; font-size: 0.9em; color: #888; border-top: 1px solid #eee; padding-top: 15px;">
    Best regards,<br>
    <strong>Cladding Solutions Team</strong>
  </p>
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
    o.fullName.trim().length > 0 &&
    typeof o.email === "string" &&
    isValidEmail(o.email) &&
    typeof o.requestType === "string" &&
    o.requestType.trim().length > 0
  );
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
}

const UPLOAD_DIR = path.join(process.cwd(), "tmp", "consultation-uploads");

/** Basic RFC‑5322–style check; rejects "@", whitespace-only locals, etc. */
function isValidEmail(s: string): boolean {
  const t = s.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

export const runtime = "nodejs";

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
      fullName: String(parsed.fullName).trim(),
      company: typeof parsed.company === "string" ? parsed.company.trim() : "",
      email: String(parsed.email).trim(),
      phone: typeof parsed.phone === "string" ? parsed.phone.trim() : "",
      projectCity: typeof parsed.projectCity === "string" ? parsed.projectCity.trim() : "",
      projectState: typeof parsed.projectState === "string" ? parsed.projectState.trim() : "",
      desiredTimeline: typeof parsed.desiredTimeline === "string" ? parsed.desiredTimeline.trim() : "",
      requestType: String(parsed.requestType).trim(),
      notes: typeof parsed.notes === "string" ? parsed.notes : "",
    };

    const files = formData.getAll("files").filter((v): v is File => v instanceof File);
    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Maximum ${MAX_FILES} files allowed.` }, { status: 400 });
    }

    const uploadDir = UPLOAD_DIR;
    await mkdir(uploadDir, { recursive: true });

    const prefix = `${Date.now()}-`;
    const uploadedFilenames: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size === 0) {
        return NextResponse.json({ error: `Empty file not allowed: ${file.name}` }, { status: 400 });
      }
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
      const storedName = `${prefix}${i}-${safeName}`;
      const filePath = path.join(uploadDir, storedName);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);
      uploadedFilenames.push(file.name);
    }

    payload.uploadedFilenames = uploadedFilenames;

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM;
    let businessRecipients = Array.from(
      new Set(
        [ORDER_COPY_EMAIL, process.env.BUSINESS_EMAIL?.trim()]
          .filter((x): x is string => typeof x === "string" && isValidEmail(x))
          .map((x) => x.trim().toLowerCase())
      )
    );
    if (businessRecipients.length === 0) {
      businessRecipients = [ORDER_COPY_EMAIL.trim().toLowerCase()];
    }

    if (apiKey && fromEmail) {
      const resend = new Resend(apiKey);
      const teamHtml = buildBusinessEmailHtml(payload);
      const customerHtml = buildCustomerEmailHtml(payload);
      const subjectTeam = `Consultation: ${payload.fullName} – ${REQUEST_TYPE_LABELS[payload.requestType] ?? payload.requestType}`;

      const businessResult = await resend.emails.send({
        from: fromEmail,
        to: businessRecipients,
        replyTo: payload.email.trim(),
        subject: subjectTeam,
        html: teamHtml,
      });

      if (businessResult.error) {
        console.error("[Consultation email error] team notification", businessResult.error);
        return NextResponse.json({ error: resendErrorMessage(businessResult.error) }, { status: 500 });
      }

      const customerResult = await resend.emails.send({
        from: fromEmail,
        to: [payload.email.trim()],
        subject: "Consultation Request Received – Cladding Solutions",
        html: customerHtml,
      });

      if (customerResult.error) {
        console.error("[Consultation email error] customer confirmation", customerResult.error);
        return NextResponse.json({ error: resendErrorMessage(customerResult.error) }, { status: 500 });
      }
    } else {
      return NextResponse.json(
        {
          error: "Mangler konfigurasjon",
          debug: { hasApiKey: !!apiKey, hasFrom: !!fromEmail },
        },
        { status: 500 }
      );
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
      { error: "Server error while processing your request." },
      { status: 500 }
    );
  }
}
