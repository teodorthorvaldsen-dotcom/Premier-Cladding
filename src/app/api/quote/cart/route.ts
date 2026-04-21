import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { normalizeBoxTraySides } from "@/lib/boxTray";
import { formatRevitTrayExportJson } from "@/lib/revitTrayExport";
import type { BoxTraySideRow } from "@/types/boxTray";
import { colors, finishes, thicknesses } from "@/data/acm";
import path from "path";
import { mkdir, writeFile } from "fs/promises";

const ORDER_COPY_EMAIL = "premiercladdingsolutions@gmail.com";

const BOX_EDGE_EMAIL_LABEL: Record<string, string> = {
  south: "Front",
  north: "Back",
  west: "Left",
  east: "Right",
};

interface CartQuoteItem {
  widthIn: number;
  heightIn: number;
  standardId: string | null;
  colorId: string;
  finishId: string;
  thicknessId: string;
  quantity: number;
  unitPrice: number;
  areaFt2: number;
  panelType?: string;
  panelTypeLabel?: string;
  customColorReference?: string;
  customColorSpecFileName?: string;
  boxTraySides?: unknown;
  trayBuildSpec?: string;
  previewImageDataUrl?: string;
}

interface CartQuotePayload {
  items: CartQuoteItem[];
  fullName: string;
  company: string;
  email: string;
  phone: string;
  projectCity: string;
  projectState: string;
  notes: string;
  paymentMethod: "wire" | "credit";
  signature: string;
}

function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

function safePreviewDataUrl(s: unknown): string | undefined {
  if (typeof s !== "string" || s.length > 2_800_000) return undefined;
  if (
    s.startsWith("data:image/jpeg;base64,") ||
    s.startsWith("data:image/png;base64,") ||
    s.startsWith("data:image/webp;base64,")
  ) {
    return s;
  }
  return undefined;
}

function baseUrlFromRequest(req: NextRequest): string | null {
  const env = process.env.PUBLIC_SITE_URL?.trim();
  if (env && /^https?:\/\//i.test(env)) return env.replace(/\/+$/, "");
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!host) return null;
  return `${proto}://${host}`.replace(/\/+$/, "");
}

function decodePreviewDataUrl(dataUrl: string): { bytes: Buffer; ext: ".jpg" | ".png" | ".webp" } | null {
  const m = dataUrl.match(/^data:image\/(jpeg|png|webp);base64,(.+)$/);
  if (!m) return null;
  const kind = m[1];
  const b64 = m[2];
  const bytes = Buffer.from(b64, "base64");
  if (!bytes.length) return null;
  const ext = kind === "png" ? ".png" : kind === "webp" ? ".webp" : ".jpg";
  return { bytes, ext };
}

async function persistPreviewAndGetUrl(
  req: NextRequest,
  orderId: string,
  itemIndex: number,
  dataUrl: unknown
): Promise<string | undefined> {
  const safe = safePreviewDataUrl(dataUrl);
  if (!safe) return undefined;
  const decoded = decodePreviewDataUrl(safe);
  if (!decoded) return undefined;

  // Hard cap (bytes) to avoid huge filesystem writes.
  if (decoded.bytes.length > 1_600_000) return undefined;

  const dir = path.join(process.cwd(), "data", "email-previews");
  await mkdir(dir, { recursive: true });
  const id = `${orderId}-${itemIndex}-${Date.now().toString(36)}`;
  const filePath = path.join(dir, `${id}${decoded.ext}`);
  await writeFile(filePath, decoded.bytes);

  const baseUrl = baseUrlFromRequest(req);
  if (!baseUrl) return undefined;
  return `${baseUrl}/api/preview/${id}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getColorLabel(colorId: string): { name: string; code: string } {
  const c = colors.find((x) => x.id === colorId);
  if (!c) return { name: colorId, code: "" };
  return { name: c.name, code: c.code };
}

function getThicknessLabel(thicknessId: string): string {
  const t = thicknesses.find((x) => x.id === thicknessId);
  return t?.label ?? thicknessId;
}

function getFinishLabel(finishId: string): string {
  const f = finishes.find((x) => x.id === finishId);
  return f?.label ?? finishId;
}

function trayMeasurementsHtml(sidesUnknown: unknown): string {
  if (!Array.isArray(sidesUnknown)) return "";
  const tray = normalizeBoxTraySides(sidesUnknown as BoxTraySideRow[]);
  if (!tray.length) return "";
  const rows = tray
    .map((s, i) => {
      const n = i + 1;
      const edgeLabel = escapeHtml(BOX_EDGE_EMAIL_LABEL[s.edge] ?? s.edge);
      return `<div>Side ${n}: ${edgeLabel} · ${s.flangeHeightIn}″ @ ${s.angleDeg}°</div>`;
    })
    .join("");
  return `<div style="margin-top:6px;font-size:12px;line-height:1.35;color:#374151;"><div style="font-weight:700;letter-spacing:.02em;text-transform:uppercase;color:#6b7280;font-size:11px;margin-bottom:4px;">Measurements</div>${rows}</div>`;
}

function buildCartEmailHtml(payload: CartQuotePayload): string {
  const subtotal = payload.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const totalSqFt = payload.items.reduce((sum, i) => sum + i.areaFt2 * i.quantity, 0);
  const paymentLabel = payload.paymentMethod === "wire" ? "Wire transfer" : "Credit card (3% fee)";
  const rows = payload.items
    .map((i) => {
      const color = getColorLabel(i.colorId);
      const thicknessLabel = getThicknessLabel(i.thicknessId);
      const finishLabel = getFinishLabel(i.finishId);
      const unit = i.unitPrice;
      const lineTotal = i.unitPrice * i.quantity;
      const lineSqFt = i.areaFt2 * i.quantity;
      const extra =
        i.customColorReference || i.customColorSpecFileName
          ? `<div style="margin-top: 6px; font-size: 0.88em; color: #555;">
              ${i.customColorReference ? `<div>Color reference: ${escapeHtml(i.customColorReference)}</div>` : ""}
              ${
                i.customColorSpecFileName
                  ? `<div>Spec PDF (name only): ${escapeHtml(i.customColorSpecFileName)} — request file via follow-up if needed</div>`
                  : ""
              }
            </div>`
          : "";
      const previewUrl = safePreviewDataUrl(i.previewImageDataUrl);
      const previewBlock = previewUrl
        ? `<div style="margin-bottom:8px;"><img src="${escapeHtml(previewUrl)}" alt="Panel preview" width="260" style="max-width:260px;height:auto;border:1px solid #ddd;border-radius:8px;background:#f4f5f7" /></div>`
        : "";
      const specBlock = i.trayBuildSpec
        ? `<pre style="margin-top:8px;padding:8px;background:#f8f9fa;border-radius:6px;font-size:11px;line-height:1.35;white-space:pre-wrap;word-break:break-word;color:#333;max-height:280px;overflow:auto">${escapeHtml(i.trayBuildSpec)}</pre>`
        : "";
      const measurementsBlock = trayMeasurementsHtml(i.boxTraySides);
      let revitBlock = "";
      try {
        if (Array.isArray(i.boxTraySides)) {
          const tray = normalizeBoxTraySides(i.boxTraySides as BoxTraySideRow[]);
          const code = formatRevitTrayExportJson(i.widthIn, i.heightIn, tray);
          revitBlock = `<details style="margin-top:8px;"><summary style="cursor:pointer;font-size:12px;color:#3730a3;">Revit / BIM JSON (all-cladding-tray-panel/v1)</summary><pre style="margin-top:6px;padding:8px;background:#eef2ff;border-radius:6px;font-size:10px;line-height:1.3;white-space:pre-wrap;word-break:break-word;max-height:240px;overflow:auto">${escapeHtml(code)}</pre></details>`;
        }
      } catch {
        revitBlock = "";
      }
      const metaBlock = `<div style="margin-top:6px;font-size:12px;line-height:1.35;color:#111827;">
        <div><strong>${escapeHtml(color.name)}</strong>${color.code ? ` · ${escapeHtml(color.code)}` : ""}</div>
        <div>${escapeHtml(thicknessLabel)} · ${escapeHtml(finishLabel)}${i.panelTypeLabel ? ` · ${escapeHtml(i.panelTypeLabel)}` : ""}</div>
        <div>${i.widthIn}″ × ${i.heightIn}″ · ${lineSqFt.toFixed(2)} ft² · Qty ${i.quantity}</div>
        <div style="margin-top:4px;color:#374151;">${escapeHtml(formatUSD(unit))} / panel · <strong>${escapeHtml(formatUSD(lineTotal))}</strong></div>
      </div>`;
      return `<tr>
          <td style="padding: 10px 12px 10px 0; border-bottom: 1px solid #eee; vertical-align: top;">${previewBlock}${metaBlock}${measurementsBlock}${extra}${specBlock}${revitBlock}</td>
          <td style="padding: 6px 12px; border-bottom: 1px solid #eee; vertical-align: top;">${escapeHtml(i.panelTypeLabel ?? "")}</td>
          <td style="padding: 6px 12px; border-bottom: 1px solid #eee; vertical-align: top;">${i.quantity}</td>
          <td style="padding: 6px 12px; border-bottom: 1px solid #eee; vertical-align: top;">${formatUSD(lineTotal)}</td>
        </tr>`;
    })
    .join("");
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
  <h2 style="margin-bottom: 0.5em;">New Quote Request (Cart)</h2>
  <p style="color: #666; margin-bottom: 1.5em;">A customer has submitted a multi-item quote request from the cart.</p>

  <h3 style="margin-bottom: 0.5em; font-size: 1em;">Customer Information</h3>
  <table style="border-collapse: collapse; margin-bottom: 1.5em;">
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Name</td><td>${escapeHtml(payload.fullName)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Company</td><td>${escapeHtml(payload.company)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Email</td><td><a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a></td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Phone</td><td>${escapeHtml(payload.phone)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Project location</td><td>${escapeHtml(payload.projectCity)}, ${escapeHtml(payload.projectState)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Payment method</td><td>${escapeHtml(paymentLabel)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Signature</td><td>${escapeHtml(payload.signature)}</td></tr>
    ${payload.notes ? `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Notes</td><td>${escapeHtml(payload.notes)}</td></tr>` : ""}
  </table>

  <h3 style="margin-bottom: 0.5em; font-size: 1em;">Line Items</h3>
  <table style="border-collapse: collapse; margin-bottom: 1.5em; width: 100%;">
    <thead>
      <tr style="background: #f5f5f5;">
        <th style="padding: 8px 12px 8px 0; text-align: left;">Panel / spec</th>
        <th style="padding: 8px 12px; text-align: left;">Type</th>
        <th style="padding: 8px 12px; text-align: right;">Qty</th>
        <th style="padding: 8px 12px; text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <p><strong>Subtotal: ${formatUSD(subtotal)}</strong> · ${totalSqFt.toFixed(1)} ft² total</p>

  <p style="color: #666; font-size: 0.9em;">Submitted via ACM Panel Cart Checkout.</p>
</body>
</html>
`;
}

function buildCartCustomerEmailHtml(payload: CartQuotePayload): string {
  const subtotal = payload.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const totalSqFt = payload.items.reduce((sum, i) => sum + i.areaFt2 * i.quantity, 0);
  const itemsHtml = payload.items
    .map((i) => {
      const color = getColorLabel(i.colorId);
      const thicknessLabel = getThicknessLabel(i.thicknessId);
      const finishLabel = getFinishLabel(i.finishId);
      const unit = i.unitPrice;
      const lineTotal = i.unitPrice * i.quantity;
      const lineSqFt = i.areaFt2 * i.quantity;
      const previewUrl = safePreviewDataUrl(i.previewImageDataUrl);
      const previewBlock = previewUrl
        ? `<div style="margin:0 0 10px 0;"><img src="${escapeHtml(previewUrl)}" alt="Panel preview" width="360" style="max-width:100%;height:auto;border:1px solid #e5e7eb;border-radius:10px;background:#f4f5f7" /></div>`
        : "";
      const measurementsBlock = trayMeasurementsHtml(i.boxTraySides);
      const customBlock =
        i.customColorReference || i.customColorSpecFileName
          ? `<div style="margin-top:8px;font-size:12px;color:#374151;">
              ${i.customColorReference ? `<div>Color reference: ${escapeHtml(i.customColorReference)}</div>` : ""}
              ${
                i.customColorSpecFileName
                  ? `<div>Spec PDF: ${escapeHtml(i.customColorSpecFileName)} (we may request this file)</div>`
                  : ""
              }
            </div>`
          : "";
      return `<div style="padding:14px 0;border-bottom:1px solid #eef2f7;">
        ${previewBlock}
        <div style="font-size:14px;color:#111827;">
          <div style="font-weight:700;">${i.widthIn}″ × ${i.heightIn}″${i.panelTypeLabel ? ` · ${escapeHtml(i.panelTypeLabel)}` : ""}</div>
          <div style="margin-top:4px;"><strong>${escapeHtml(color.name)}</strong>${color.code ? ` · ${escapeHtml(color.code)}` : ""}</div>
          <div style="color:#374151;">${escapeHtml(thicknessLabel)} · ${escapeHtml(finishLabel)} · Qty ${i.quantity} · ${lineSqFt.toFixed(2)} ft²</div>
          <div style="margin-top:6px;color:#374151;">${escapeHtml(formatUSD(unit))} / panel · <strong>${escapeHtml(formatUSD(lineTotal))}</strong></div>
          ${measurementsBlock}
          ${customBlock}
        </div>
      </div>`;
    })
    .join("");
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #111827; max-width: 680px;">
  <h2 style="margin-bottom: 0.25em;">Estimate Request Received</h2>
  <p style="margin-top:0;color:#4b5563;">Hi ${escapeHtml(payload.fullName)}, we received your request. Here’s a copy of your order summary.</p>

  <h3 style="margin: 18px 0 8px 0; font-size: 1em;">Order summary</h3>
  <div style="border-top:1px solid #eef2f7;">${itemsHtml}</div>

  <p style="margin-top:14px;"><strong>Subtotal: ${formatUSD(subtotal)}</strong> · ${totalSqFt.toFixed(1)} ft² total</p>
  <p style="color:#4b5563;font-size:13px;">Final pricing will be confirmed after we verify inventory and prepare your estimate.</p>
  <p style="color: #6b7280; font-size: 0.9em;">— Premier Cladding</p>
</body>
</html>
`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (
      !body ||
      typeof body !== "object" ||
      !Array.isArray(body.items) ||
      body.items.length === 0 ||
      typeof body.fullName !== "string" ||
      typeof body.email !== "string" ||
      !body.email.includes("@") ||
      typeof body.signature !== "string" ||
      !body.signature.trim()
    ) {
      return NextResponse.json(
        { error: "Invalid request. Required: items (array), fullName, email, signature." },
        { status: 400 }
      );
    }
    const orderId = `ORD-Q-${Date.now().toString(36)}`;

    const itemsWithHostedPreviews: CartQuoteItem[] = await Promise.all(
      body.items.map(async (it: CartQuoteItem, idx: number) => {
        try {
          const hosted = await persistPreviewAndGetUrl(request, orderId, idx + 1, it.previewImageDataUrl);
          return hosted ? { ...it, previewImageDataUrl: hosted } : it;
        } catch {
          return it;
        }
      })
    );

    const payload: CartQuotePayload = {
      items: itemsWithHostedPreviews,
      fullName: body.fullName,
      company: body.company ?? "",
      email: body.email,
      phone: body.phone ?? "",
      projectCity: body.projectCity ?? "",
      projectState: body.projectState ?? "",
      notes: body.notes ?? "",
      paymentMethod: body.paymentMethod === "credit" ? "credit" : "wire",
      signature: body.signature.trim(),
    };

    const businessRecipients = Array.from(
      new Set([process.env.BUSINESS_EMAIL, ORDER_COPY_EMAIL].filter(Boolean))
    ) as string[];

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM;

    let emailSent = false;

    if (apiKey && fromEmail) {
      const resend = new Resend(apiKey);
      // Two sends: full line-item HTML to the business inbox(es), and a matching summary to the customer.
      const [businessResult, customerResult] = await Promise.all([
        resend.emails.send({
          from: fromEmail,
          to: businessRecipients,
          subject: `Cart Quote Request: ${payload.fullName} – ${payload.items.length} item(s)`,
          html: buildCartEmailHtml(payload),
        }),
        resend.emails.send({
          from: fromEmail,
          to: payload.email,
          subject: "Quote Request Received – Premier Cladding",
          html: buildCartCustomerEmailHtml(payload),
        }),
      ]);

      if (businessResult.error || customerResult.error) {
        const err = businessResult.error ?? customerResult.error;
        console.error("[Cart quote email error]", err);
        return NextResponse.json(
          { error: "Failed to send email. Please try again." },
          { status: 500 }
        );
      }
      emailSent = true;
    } else {
      console.warn(
        "[Cart quote] Email not sent: set RESEND_API_KEY and EMAIL_FROM (e.g. in Vercel → Project → Settings → Environment Variables).",
        { orderId, businessRecipients }
      );
    }

    return NextResponse.json({ ok: true, orderId, emailSent });
  } catch (e) {
    console.error("[Cart quote API error]", e);
    return NextResponse.json(
      { error: "Invalid request or server error." },
      { status: 400 }
    );
  }
}
