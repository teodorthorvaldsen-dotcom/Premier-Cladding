import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { normalizeBoxTraySides } from "@/lib/boxTray";
import { resendEmailAccepted } from "@/lib/resendResult";
import { buildPortalOrderFromCartQuote } from "@/lib/portalOrders";
import { appendDynamicQuoteOrder } from "@/lib/portalPersistence";
import type { BoxTraySideRow } from "@/types/boxTray";
import { colors, finishes, thicknesses } from "@/data/acm";

export const runtime = "nodejs";

const ORDER_COPY_EMAIL = "premiercladdingsolutions@gmail.com";

const BOX_EDGE_EMAIL_LABEL: Record<string, string> = {
  south: "Front",
  north: "Back",
  west: "Left",
  east: "Right",
};

interface CartQuoteItem {
  productKind?: "acm" | "flashing";
  productLabel?: string;
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
  clipsNeeded?: number;
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function siteUrlForEmails(): string | null {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;
  return null;
}

function staffAcmWorkspaceUrl(orderId: string, lineIndex: number): string | null {
  const base = siteUrlForEmails();
  if (!base) return null;
  return `${base}/portal/acm-panels?orderId=${encodeURIComponent(orderId)}&line=${String(lineIndex)}`;
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

function isValidEmail(s: string): boolean {
  const t = s.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

const MAX_PREVIEW_DATA_URL_CHARS = 2_800_000;
const MAX_PREVIEW_IMAGE_BYTES = 900_000;

type InlineImageAttachment = {
  filename: string;
  content: Buffer;
  contentType: string;
  contentId: string;
};

/** Parse a browser data-URL capture into an inline CID attachment for admin email. */
function previewDataUrlToInlineAttachment(
  raw: unknown,
  contentId: string
): InlineImageAttachment | null {
  if (typeof raw !== "string" || raw.length < 40 || raw.length > MAX_PREVIEW_DATA_URL_CHARS) {
    return null;
  }
  const rules: { lead: string; ext: string; mime: string }[] = [
    { lead: "data:image/jpeg;base64,", ext: "jpg", mime: "image/jpeg" },
    { lead: "data:image/png;base64,", ext: "png", mime: "image/png" },
    { lead: "data:image/webp;base64,", ext: "webp", mime: "image/webp" },
  ];
  for (const { lead, ext, mime } of rules) {
    if (!raw.startsWith(lead)) continue;
    const b64 = raw.slice(lead.length).replace(/\s/g, "");
    if (b64.length < 24) continue;
    let buf: Buffer;
    try {
      buf = Buffer.from(b64, "base64");
    } catch {
      continue;
    }
    if (buf.length === 0 || buf.length > MAX_PREVIEW_IMAGE_BYTES) continue;
    return {
      filename: `panel-preview.${ext}`,
      content: buf,
      contentType: mime,
      contentId,
    };
  }
  return null;
}

function buildCartPreviewInlineAttachments(items: CartQuoteItem[]): {
  cids: (string | null)[];
  attachments: InlineImageAttachment[];
} {
  const cids: (string | null)[] = [];
  const attachments: InlineImageAttachment[] = [];
  items.forEach((item, index) => {
    const cid = `panel-line-${index}`;
    const att = previewDataUrlToInlineAttachment(item.previewImageDataUrl, cid);
    if (att) {
      attachments.push(att);
      cids.push(cid);
    } else {
      cids.push(null);
    }
  });
  return { cids, attachments };
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

function buildCartEmailHtml(payload: CartQuotePayload, previewCids: (string | null)[], orderId: string): string {
  const subtotal = payload.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const paymentLabel = payload.paymentMethod === "wire" ? "Wire transfer" : "Credit card (3% fee)";
  const workspaceHero = staffAcmWorkspaceUrl(orderId, 0);
  const workspaceHeroBlock = workspaceHero
    ? `<div style="margin:0 0 16px 0;padding:12px 14px;border:1px solid #bfdbfe;border-radius:10px;background:#eff6ff;">
        <div style="font-size:13px;color:#1e3a8a;font-weight:600;margin-bottom:6px;">3D preview in the staff workspace</div>
        <a href="${escapeHtml(workspaceHero)}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:10px;font-size:13px;font-weight:600;">Open staff ACM panel workspace</a>
        <div style="margin-top:8px;font-size:12px;color:#334155;">Sign in with your admin or subcontractor account. For carts with multiple lines, use the link on each row to open that line.</div>
      </div>`
    : `<p style="margin:0 0 12px 0;font-size:12px;color:#64748b;">Configure <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;">NEXT_PUBLIC_SITE_URL</code> on the server so workspace links appear in this email (Vercel also provides <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;">VERCEL_URL</code>).</p>`;
  const rows = payload.items
    .map((i, rowIndex) => {
      const color = getColorLabel(i.colorId);
      const thicknessLabel = getThicknessLabel(i.thicknessId);
      const finishLabel = getFinishLabel(i.finishId);
      const unit = i.unitPrice;
      const lineTotal = i.unitPrice * i.quantity;
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
      const cid = previewCids[rowIndex] ?? null;
      const previewBlock = cid
        ? `<div style="margin-bottom:8px;"><img src="cid:${escapeHtml(cid)}" alt="3D panel preview" width="280" style="max-width:280px;height:auto;border:1px solid #ddd;border-radius:8px;background:#f4f5f7;display:block" /></div>`
        : i.previewImageDataUrl
          ? `<div style="margin-bottom:8px;font-size:12px;color:#666;">3D preview was submitted but could not be embedded (too large or unsupported format).</div>`
          : "";
      const specRaw = typeof i.trayBuildSpec === "string" ? i.trayBuildSpec : "";
      const specTrimmed = specRaw ? truncateForEmail(specRaw, 12_000) : "";
      const specBlock = specTrimmed
        ? `<pre style="margin-top:8px;padding:8px;background:#f8f9fa;border-radius:6px;font-size:11px;line-height:1.35;white-space:pre-wrap;word-break:break-word;color:#333;max-height:280px;overflow:auto">${escapeHtml(specTrimmed)}</pre>`
        : "";
      const measurementsBlock = trayMeasurementsHtml(i.boxTraySides);
      const workspaceLine = staffAcmWorkspaceUrl(orderId, rowIndex);
      const workspaceLineBlock = workspaceLine
        ? `<div style="margin-top:8px;"><a href="${escapeHtml(workspaceLine)}" style="font-size:12px;color:#1d4ed8;text-decoration:underline;">Open this line in staff ACM workspace (3D)</a></div>`
        : "";
      const productLabel = i.productLabel ?? (i.productKind === "flashing" ? "Flashing" : "ACM Panels");
      const clipsLine =
        typeof i.clipsNeeded === "number" && Number.isFinite(i.clipsNeeded) && i.clipsNeeded > 0
          ? ` · ${Math.round(i.clipsNeeded)} clips/panel`
          : "";
      const metaBlock = `<div style="margin-top:6px;font-size:12px;line-height:1.35;color:#111827;">
        <div><strong>${escapeHtml(color.name)}</strong>${color.code ? ` · ${escapeHtml(color.code)}` : ""}</div>
        <div><strong>${escapeHtml(productLabel)}</strong> · ${escapeHtml(thicknessLabel)} · ${escapeHtml(finishLabel)}${i.panelTypeLabel ? ` · ${escapeHtml(i.panelTypeLabel)}` : ""}${clipsLine}</div>
        <div>${i.widthIn}″ × ${i.heightIn}″ · Qty ${i.quantity}</div>
        <div style="margin-top:4px;color:#374151;">${escapeHtml(formatUSD(unit))} / panel · <strong>${escapeHtml(formatUSD(lineTotal))}</strong></div>
      </div>`;
      return `<tr>
          <td style="padding: 10px 12px 10px 0; border-bottom: 1px solid #eee; vertical-align: top;">${previewBlock}${workspaceLineBlock}${metaBlock}${measurementsBlock}${extra}${specBlock}</td>
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
  ${workspaceHeroBlock}

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
  <p><strong>Subtotal: ${formatUSD(subtotal)}</strong></p>

  <p style="color: #666; font-size: 0.9em;">Submitted via ACM Panel Cart Checkout.</p>
</body>
</html>
`;
}

function buildCartCustomerEmailHtml(
  payload: CartQuotePayload,
  orderId: string,
  previewCids: (string | null)[]
): string {
  const subtotal = payload.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const paymentLabel = payload.paymentMethod === "wire" ? "Wire transfer" : "Credit card (3% fee)";

  const itemsHtml = payload.items
    .map((i, rowIndex) => {
      const color = getColorLabel(i.colorId);
      const thicknessLabel = getThicknessLabel(i.thicknessId);
      const finishLabel = getFinishLabel(i.finishId);
      const unit = i.unitPrice;
      const lineTotal = i.unitPrice * i.quantity;
      const cid = previewCids[rowIndex] ?? null;
      const previewBlock = cid
        ? `<div style="margin:0 0 10px 0;"><img src="cid:${escapeHtml(cid)}" alt="Panel preview" width="280" style="max-width:280px;height:auto;border:1px solid #e5e7eb;border-radius:8px;background:#f4f5f7;display:block" /></div>`
        : i.previewImageDataUrl
          ? `<div style="margin:0 0 10px 0;font-size:12px;color:#6b7280;">A panel preview was captured but could not be embedded in this email (too large or unsupported format).</div>`
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
      const productLabel = i.productLabel ?? (i.productKind === "flashing" ? "Flashing" : "ACM Panels");
      const clipsLine =
        typeof i.clipsNeeded === "number" && Number.isFinite(i.clipsNeeded) && i.clipsNeeded > 0
          ? ` · ${Math.round(i.clipsNeeded)} clips/panel`
          : "";
      return `<div style="padding:14px 0;border-bottom:1px solid #eef2f7;">
        ${previewBlock}
        <div style="font-size:14px;color:#111827;">
          <div style="font-weight:700;">${escapeHtml(productLabel)} · ${i.widthIn}″ × ${i.heightIn}″${i.panelTypeLabel ? ` · ${escapeHtml(i.panelTypeLabel)}` : ""}${clipsLine}</div>
          <div style="margin-top:4px;"><strong>${escapeHtml(color.name)}</strong>${color.code ? ` · ${escapeHtml(color.code)}` : ""}</div>
          <div style="color:#374151;">${escapeHtml(thicknessLabel)} · ${escapeHtml(finishLabel)} · Qty ${i.quantity}</div>
          <div style="margin-top:6px;color:#374151;">${escapeHtml(formatUSD(unit))} / panel · <strong>${escapeHtml(formatUSD(lineTotal))}</strong></div>
          ${measurementsBlock}
          ${customBlock}
        </div>
      </div>`;
    })
    .join("");

  const customerNotes = payload.notes ? truncateForEmail(payload.notes, 4_000) : "";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #111827; max-width: 680px;">
  <h2 style="margin-bottom: 0.25em;">Estimate request received</h2>
  <p style="margin-top:0;color:#4b5563;">Hi ${escapeHtml(payload.fullName)}, we received your request. Below is a copy of what you submitted.</p>

  <div style="margin:16px 0;padding:14px 16px;border:1px solid #e5e7eb;border-radius:10px;background:#fafafa;">
    <div style="font-size:13px;color:#374151;margin-bottom:6px;"><strong>Request ID:</strong> ${escapeHtml(orderId)}</div>
    <div style="font-size:13px;color:#374151;margin-bottom:6px;"><strong>Preferred payment:</strong> ${escapeHtml(paymentLabel)}</div>
    <div style="font-size:13px;color:#374151;margin-bottom:6px;"><strong>Project:</strong> ${escapeHtml(payload.projectCity)}, ${escapeHtml(payload.projectState)}</div>
    ${payload.company ? `<div style="font-size:13px;color:#374151;"><strong>Company:</strong> ${escapeHtml(payload.company)}</div>` : ""}
  </div>

  <h3 style="margin: 18px 0 8px 0; font-size: 1em;">Order summary</h3>
  <div style="border-top:1px solid #eef2f7;">${itemsHtml}</div>

  <p style="margin-top:14px;"><strong>Subtotal: ${formatUSD(subtotal)}</strong></p>
  ${customerNotes ? `<p style="margin-top:12px;color:#374151;"><strong>Your notes:</strong><br><span style="white-space:pre-wrap;">${escapeHtml(customerNotes)}</span></p>` : ""}
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
    const payload: CartQuotePayload = {
      items: body.items,
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

    const orderId = `ORD-Q-${Date.now().toString(36)}`;
    try {
      const order = buildPortalOrderFromCartQuote({
        orderId,
        customerId: `guest-${orderId}`,
        payload: {
          fullName: payload.fullName,
          company: payload.company,
          email: payload.email,
          phone: payload.phone,
          projectCity: payload.projectCity,
          projectState: payload.projectState,
        },
        items: payload.items,
      });
      appendDynamicQuoteOrder(order);
    } catch (e) {
      console.error("[Cart quote portal persist]", e);
    }

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

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM;

    let emailSent = false;

    if (apiKey && fromEmail) {
      const resend = new Resend(apiKey);
      const { cids: previewCids, attachments: previewAttachments } =
        buildCartPreviewInlineAttachments(payload.items);
      const teamHtml = buildCartEmailHtml(payload, previewCids, orderId);
      const customerHtml = buildCartCustomerEmailHtml(payload, orderId, previewCids);

      const businessResult = await resend.emails.send({
        from: fromEmail,
        to: businessRecipients,
        replyTo: payload.email.trim(),
        subject: `Cart Quote Request: ${payload.fullName} – ${payload.items.length} item(s)`,
        html: teamHtml,
        ...(previewAttachments.length > 0
          ? {
              attachments: previewAttachments.map((a) => ({
                filename: a.filename,
                content: a.content,
                contentType: a.contentType,
                contentId: a.contentId,
              })),
            }
          : {}),
      });

      const businessAccepted = resendEmailAccepted(businessResult);
      if (businessResult.error && !businessAccepted) {
        console.error("[Cart quote email error] team notification", businessResult.error);
      }

      const customerResult = await resend.emails.send({
        from: fromEmail,
        to: [payload.email.trim()],
        subject: `Estimate request received – ${orderId}`,
        html: customerHtml,
        ...(previewAttachments.length > 0
          ? {
              attachments: previewAttachments.map((a) => ({
                filename: a.filename,
                content: a.content,
                contentType: a.contentType,
                contentId: a.contentId,
              })),
            }
          : {}),
      });
      const customerAccepted = resendEmailAccepted(customerResult);
      if (customerResult.error && !customerAccepted) {
        console.error("[Cart quote email error] customer confirmation", customerResult.error);
      }

      if (!businessAccepted && !customerAccepted) {
        const err = customerResult.error ?? businessResult.error;
        console.error("[Cart quote email error]", err);
        return NextResponse.json({ error: resendErrorMessage(err) }, { status: 500 });
      }

      if (!businessAccepted || !customerAccepted) {
        console.warn("[Cart quote email partial failure]", {
          businessError: businessResult.error ?? null,
          customerError: customerResult.error ?? null,
          businessAccepted,
          customerAccepted,
        });
      }
      emailSent = customerAccepted;
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
