import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

interface CartQuotePayload {
  items: Array<{
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
    foldFromLeftIn?: number;
    foldFromBottomIn?: number;
  }>;
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

function buildCartEmailHtml(payload: CartQuotePayload): string {
  const subtotal = payload.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const totalSqFt = payload.items.reduce((sum, i) => sum + i.areaFt2 * i.quantity, 0);
  const paymentLabel = payload.paymentMethod === "wire" ? "Wire transfer" : "Credit card (3% fee)";
  const rows = payload.items
    .map((i) => {
      const foldNote =
        typeof i.foldFromLeftIn === "number" || typeof i.foldFromBottomIn === "number"
          ? `<div>Bend lines: ${typeof i.foldFromLeftIn === "number" ? `${i.foldFromLeftIn}" from left edge` : ""}${
              typeof i.foldFromLeftIn === "number" && typeof i.foldFromBottomIn === "number" ? "; " : ""
            }${typeof i.foldFromBottomIn === "number" ? `${i.foldFromBottomIn}" from bottom edge` : ""}</div>`
          : "";
      const extra =
        i.customColorReference || i.customColorSpecFileName || foldNote
          ? `<div style="margin-top: 6px; font-size: 0.88em; color: #555;">
              ${foldNote}
              ${i.customColorReference ? `<div>Color reference: ${escapeHtml(i.customColorReference)}</div>` : ""}
              ${
                i.customColorSpecFileName
                  ? `<div>Spec PDF (name only): ${escapeHtml(i.customColorSpecFileName)} — request file via follow-up if needed</div>`
                  : ""
              }
            </div>`
          : "";
      return `<tr>
          <td style="padding: 6px 12px 6px 0; border-bottom: 1px solid #eee; vertical-align: top;">${i.widthIn}" × ${i.heightIn} in${extra}</td>
          <td style="padding: 6px 12px; border-bottom: 1px solid #eee; vertical-align: top;">${escapeHtml(i.panelTypeLabel ?? "")}</td>
          <td style="padding: 6px 12px; border-bottom: 1px solid #eee; vertical-align: top;">${i.quantity}</td>
          <td style="padding: 6px 12px; border-bottom: 1px solid #eee; vertical-align: top;">${formatUSD(i.unitPrice * i.quantity)}</td>
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
        <th style="padding: 8px 12px 8px 0; text-align: left;">Size</th>
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

    const apiKey = process.env.RESEND_API_KEY;
    const businessEmail = process.env.BUSINESS_EMAIL ?? "allcladdingsolutions@gmail.com";
    const fromEmail = process.env.EMAIL_FROM;

    if (!apiKey || !fromEmail) {
      return NextResponse.json(
        { error: "Email delivery is not configured. Set RESEND_API_KEY and EMAIL_FROM." },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    const [businessResult, customerResult] = await Promise.all([
      resend.emails.send({
        from: fromEmail,
        to: businessEmail,
        subject: `Cart Quote Request: ${payload.fullName} – ${payload.items.length} item(s)`,
        html: buildCartEmailHtml(payload),
      }),
      resend.emails.send({
        from: fromEmail,
        to: payload.email,
        subject: "Quote Request Received – All Cladding Solutions",
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
  <h2>Quote Request Received</h2>
  <p>Dear ${escapeHtml(payload.fullName)},</p>
  <p>Thank you for your quote request. We have received your cart and will respond with a finalized quote for your signature. Once the quote is approved, a 50% deposit will be required; the remainder is due upon shipping.</p>
  <p style="color: #666; font-size: 0.9em;">— All Cladding Solutions</p>
</body>
</html>
`,
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

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Cart quote API error]", e);
    return NextResponse.json(
      { error: "Invalid request or server error." },
      { status: 400 }
    );
  }
}
