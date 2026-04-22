import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const ORDER_COPY_EMAIL = "premiercladdingsolutions@gmail.com";

type ContactBody = {
  name: string;
  email: string;
  message: string;
  company?: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isValidEmail(s: string): boolean {
  const t = s.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
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

function buildTeamHtml(payload: ContactBody): string {
  const msg = truncateForEmail(payload.message, 12_000);
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
  <h2>New website contact message</h2>
  <table style="border-collapse: collapse;">
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Name</td><td>${escapeHtml(payload.name)}</td></tr>
    ${payload.company ? `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Company</td><td>${escapeHtml(payload.company)}</td></tr>` : ""}
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Email</td><td><a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a></td></tr>
  </table>
  <h3 style="margin-top: 1.25em;">Message</h3>
  <p style="white-space: pre-wrap;">${escapeHtml(msg)}</p>
</body>
</html>
`;
}

function buildCustomerAckHtml(payload: ContactBody): string {
  const msg = truncateForEmail(payload.message, 4_000);
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
  <h2>Message received</h2>
  <p>Hi ${escapeHtml(payload.name)},</p>
  <p>Thanks for contacting Premier Cladding. We received your message and will get back to you as soon as we can.</p>
  <div style="background:#f9f9f9;border:1px solid #eee;border-radius:8px;padding:16px;margin:16px 0;">
    <p style="margin:0 0 8px;"><strong>Your message</strong></p>
    <p style="margin:0;white-space:pre-wrap;">${escapeHtml(msg)}</p>
  </div>
</body>
</html>
`;
}

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON." }, { status: 400 });
    }
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid body." }, { status: 400 });
    }
    const o = body as Record<string, unknown>;
    const name = typeof o.name === "string" ? o.name.trim() : "";
    const email = typeof o.email === "string" ? o.email.trim() : "";
    const message = typeof o.message === "string" ? o.message.trim() : "";
    const company = typeof o.company === "string" ? o.company.trim() : "";

    if (!name || !isValidEmail(email) || !message) {
      return NextResponse.json(
        { success: false, error: "Name, a valid email, and a message are required." },
        { status: 400 }
      );
    }

    const payload: ContactBody = { name, email, message, ...(company ? { company } : {}) };

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

    if (!apiKey || !fromEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "Mangler konfigurasjon",
          debug: { hasApiKey: !!apiKey, hasFrom: !!fromEmail },
        },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    const teamHtml = buildTeamHtml(payload);
    const customerHtml = buildCustomerAckHtml(payload);

    const businessResult = await resend.emails.send({
      from: fromEmail,
      to: businessRecipients,
      replyTo: payload.email,
      subject: `Website contact: ${payload.name}`,
      html: teamHtml,
    });

    if (businessResult.error) {
      console.error("[Contact email] team", businessResult.error);
      return NextResponse.json(
        { success: false, error: resendErrorMessage(businessResult.error) },
        { status: 500 }
      );
    }

    const customerResult = await resend.emails.send({
      from: fromEmail,
      to: [payload.email],
      subject: "We received your message – Premier Cladding",
      html: customerHtml,
    });

    if (customerResult.error) {
      console.error("[Contact email] customer ack", customerResult.error);
      return NextResponse.json(
        { success: false, error: resendErrorMessage(customerResult.error) },
        { status: 500 }
      );
    }

    const data = {
      teamEmailId: businessResult.data?.id ?? null,
      customerEmailId: customerResult.data?.id ?? null,
      receivedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (e) {
    console.error("[Contact API]", e);
    return NextResponse.json({ success: false, error: "Server error." }, { status: 500 });
  }
}
