import { writeFile, mkdir, appendFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import type { QuoteDraft } from "@/types/quote";

const QUOTES_JSONL_PATH = path.join(process.cwd(), "data", "quotes.jsonl");

const MAX_FILES = 5;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg"];

interface QuotePayload {
  config: QuoteDraft;
  fullName: string;
  company: string;
  email: string;
  phone: string;
  projectCity: string;
  projectState: string;
  notes: string;
  uploadedFilenames?: string[];
  paymentMethod?: "wire" | "credit";
  signature?: string;
}

function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

function buildBusinessEmailHtml(payload: QuotePayload): string {
  const c = payload.config;
  const unitPrice = c.quantity > 0 ? c.estimatedTotal / c.quantity : 0;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
  <h2 style="margin-bottom: 0.5em;">New Quote Request</h2>
  <p style="color: #666; margin-bottom: 1.5em;">A customer has requested a final quote for ACM panels.</p>

  <h3 style="margin-bottom: 0.5em; font-size: 1em;">Customer Information</h3>
  <table style="border-collapse: collapse; margin-bottom: 1.5em;">
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Name</td><td>${escapeHtml(payload.fullName)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Company</td><td>${escapeHtml(payload.company)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Email</td><td><a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a></td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Phone</td><td>${escapeHtml(payload.phone)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Project location</td><td>${escapeHtml(payload.projectCity)}, ${escapeHtml(payload.projectState)}</td></tr>
    ${payload.paymentMethod ? `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Payment</td><td>${payload.paymentMethod === "credit" ? "Credit card (3% fee)" : "Wire transfer"}</td></tr>` : ""}
    ${payload.signature ? `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Signature</td><td>${escapeHtml(payload.signature)}</td></tr>` : ""}
    ${payload.notes ? `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Notes</td><td>${escapeHtml(payload.notes)}</td></tr>` : ""}
    ${payload.uploadedFilenames?.length ? `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Attachments</td><td>${payload.uploadedFilenames.map((f) => escapeHtml(f)).join(", ")}</td></tr>` : ""}
  </table>

  <h3 style="margin-bottom: 0.5em; font-size: 1em;">Configuration</h3>
  <table style="border-collapse: collapse; margin-bottom: 1.5em;">
    ${c.panelTypeLabel ? `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Panel type</td><td>${escapeHtml(c.panelTypeLabel)}</td></tr>` : ""}
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Size</td><td>${escapeHtml(c.widthLabel)} × ${c.lengthIn} in</td></tr>
    ${
      typeof c.bendAllowanceIn === "number" && c.bendAllowanceIn > 0
        ? `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Bend allowance (preview)</td><td>${c.bendAllowanceIn} in</td></tr>`
        : ""
    }
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Thickness</td><td>${escapeHtml(c.thicknessLabel)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Color</td><td>${escapeHtml(c.colorName)} (${escapeHtml(c.colorCode)})</td></tr>
    ${
      c.customColorReference
        ? `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Color reference</td><td>${escapeHtml(c.customColorReference)}</td></tr>`
        : ""
    }
    ${
      c.customColorSpecAttachment
        ? `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Custom color PDF</td><td>${escapeHtml(c.customColorSpecAttachment.fileName)} (attached)</td></tr>`
        : ""
    }
    ${
      c.customColorSpecOversizeFileName
        ? `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Custom color PDF</td><td>Large file — please confirm customer re-attached: ${escapeHtml(c.customColorSpecOversizeFileName)}</td></tr>`
        : ""
    }
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Finish</td><td>${escapeHtml(c.finishLabel)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Quantity</td><td>${c.quantity} panels</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Total sq ft</td><td>${c.totalSqFt.toFixed(2)} ft²</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Unit price</td><td>${formatUSD(unitPrice)} per panel</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Estimated total</td><td><strong>${formatUSD(c.estimatedTotal)}</strong></td></tr>
  </table>

  <p style="color: #666; font-size: 0.9em;">Submitted via ACM Panel Configurator.</p>
</body>
</html>
`;
}

function buildCustomerEmailHtml(payload: QuotePayload): string {
  const c = payload.config;
  const unitPrice = c.quantity > 0 ? c.estimatedTotal / c.quantity : 0;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
  <h2 style="margin-bottom: 0.5em;">Quote Request Received</h2>
  <p>Dear ${escapeHtml(payload.fullName)},</p>
  <p>Thank you for your quote request. We have received the following configuration and will respond within 1 business day.</p>

  <h3 style="margin-bottom: 0.5em; font-size: 1em;">Your Configuration</h3>
  <table style="border-collapse: collapse; margin-bottom: 1.5em;">
    ${c.panelTypeLabel ? `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Panel type</td><td>${escapeHtml(c.panelTypeLabel)}</td></tr>` : ""}
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Size</td><td>${escapeHtml(c.widthLabel)} × ${c.lengthIn} in</td></tr>
    ${
      typeof c.bendAllowanceIn === "number" && c.bendAllowanceIn > 0
        ? `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Bend allowance (preview)</td><td>${c.bendAllowanceIn} in</td></tr>`
        : ""
    }
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Thickness</td><td>${escapeHtml(c.thicknessLabel)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Color</td><td>${escapeHtml(c.colorName)} (${escapeHtml(c.colorCode)})</td></tr>
    ${
      c.customColorReference
        ? `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Color reference</td><td>${escapeHtml(c.customColorReference)}</td></tr>`
        : ""
    }
    ${
      c.customColorSpecAttachment
        ? `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Custom color PDF</td><td>${escapeHtml(c.customColorSpecAttachment.fileName)} (attached)</td></tr>`
        : ""
    }
    ${
      c.customColorSpecOversizeFileName
        ? `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Custom color PDF</td><td>Large file (${escapeHtml(c.customColorSpecOversizeFileName)}) — please add it under Drawings on the quote form if you have not already.</td></tr>`
        : ""
    }
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Finish</td><td>${escapeHtml(c.finishLabel)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Quantity</td><td>${c.quantity} panels</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Total sq ft</td><td>${c.totalSqFt.toFixed(2)} ft²</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Unit price</td><td>${formatUSD(unitPrice)} per panel</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Estimated total</td><td><strong>${formatUSD(c.estimatedTotal)}</strong></td></tr>
  </table>

  <p>Our team will review your request and send a final quote shortly.</p>
  <p style="color: #666; font-size: 0.9em;">— ACM Panels</p>
</body>
</html>
`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function validatePayload(body: unknown): body is QuotePayload {
  if (!body || typeof body !== "object") return false;
  const o = body as Record<string, unknown>;
  const config = o.config;
  if (!config || typeof config !== "object") return false;
  const cfg = config as Record<string, unknown>;
  return (
    typeof cfg.widthIn === "number" &&
    typeof cfg.lengthIn === "number" &&
    typeof cfg.thicknessId === "string" &&
    typeof cfg.colorId === "string" &&
    typeof cfg.quantity === "number" &&
    typeof cfg.totalSqFt === "number" &&
    typeof cfg.estimatedTotal === "number" &&
    typeof o.fullName === "string" &&
    typeof o.email === "string" &&
    o.email.includes("@")
  );
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let payload: QuotePayload;
    let uploadedFilenames: string[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const payloadStr = formData.get("payload");
      if (typeof payloadStr !== "string") {
        return NextResponse.json(
          { error: "Invalid request. Missing payload." },
          { status: 400 }
        );
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(payloadStr);
      } catch {
        return NextResponse.json(
          { error: "Invalid payload JSON." },
          { status: 400 }
        );
      }
      if (!validatePayload(parsed)) {
        return NextResponse.json(
          { error: "Invalid request body. Required: config, fullName, email." },
          { status: 400 }
        );
      }
      payload = parsed;

      const drawings = formData.getAll("drawings").filter((v): v is File => v instanceof File);
      if (drawings.length > MAX_FILES) {
        return NextResponse.json(
          { error: `Maximum ${MAX_FILES} files allowed.` },
          { status: 400 }
        );
      }

      const uploadDir = path.join(process.cwd(), "tmp", "quote-uploads");
      await mkdir(uploadDir, { recursive: true });

      const prefix = `${Date.now()}-`;
      for (const file of drawings) {
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
    } else {
      const body = await request.json();
      if (!validatePayload(body)) {
        return NextResponse.json(
          { error: "Invalid request body. Required: config, fullName, email." },
          { status: 400 }
        );
      }
      payload = body as QuotePayload;
    }

    const apiKey = process.env.RESEND_API_KEY;
    const businessEmail = process.env.BUSINESS_EMAIL;
    const fromEmail = process.env.EMAIL_FROM;

    if (!apiKey || !businessEmail || !fromEmail) {
      return NextResponse.json(
        {
          error:
            "Email delivery is not configured. Set RESEND_API_KEY, BUSINESS_EMAIL, and EMAIL_FROM.",
        },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    const [businessResult, customerResult] = await Promise.all([
      resend.emails.send({
        from: fromEmail,
        to: businessEmail,
        subject: `Quote Request: ${payload.fullName} – ${payload.config.totalSqFt.toFixed(1)} ft²`,
        html: buildBusinessEmailHtml(payload),
      }),
      resend.emails.send({
        from: fromEmail,
        to: payload.email,
        subject: "Quote Request Received – ACM Panels",
        html: buildCustomerEmailHtml(payload),
      }),
    ]);

    if (businessResult.error || customerResult.error) {
      const err = businessResult.error ?? customerResult.error;
      console.error("[Quote email error]", err);
      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 500 }
      );
    }

    const record = {
      at: new Date().toISOString(),
      config: payload.config,
      fullName: payload.fullName,
      company: payload.company,
      email: payload.email,
      phone: payload.phone,
      projectCity: payload.projectCity,
      projectState: payload.projectState,
      notes: payload.notes,
      uploadedFilenames: payload.uploadedFilenames ?? [],
    };
    const dataDir = path.dirname(QUOTES_JSONL_PATH);
    await mkdir(dataDir, { recursive: true });
    await appendFile(QUOTES_JSONL_PATH, JSON.stringify(record) + "\n");

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Quote API error]", e);
    return NextResponse.json(
      { error: "Invalid request body or server error." },
      { status: 400 }
    );
  }
}
