import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

interface ContactPayload {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  message: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildContactEmailHtml(payload: ContactPayload): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
  <h2 style="margin-bottom: 0.5em;">New Contact Form Submission</h2>
  <p style="color: #666; margin-bottom: 1.5em;">A message was submitted via the Cladding Solutions contact form.</p>

  <table style="border-collapse: collapse; margin-bottom: 1.5em;">
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Name</td><td>${escapeHtml(payload.name)}</td></tr>
    ${payload.company ? `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Company</td><td>${escapeHtml(payload.company)}</td></tr>` : ""}
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Email</td><td><a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a></td></tr>
    ${payload.phone ? `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Phone</td><td>${escapeHtml(payload.phone)}</td></tr>` : ""}
  </table>

  <h3 style="margin-bottom: 0.5em; font-size: 1em;">Message</h3>
  <p style="white-space: pre-wrap; margin: 0;">${escapeHtml(payload.message)}</p>

  <p style="color: #666; font-size: 0.9em; margin-top: 1.5em;">Submitted via Cladding Solutions contact form.</p>
</body>
</html>
`;
}

function validatePayload(body: unknown): body is ContactPayload {
  if (!body || typeof body !== "object") return false;
  const o = body as Record<string, unknown>;
  return (
    typeof o.name === "string" &&
    o.name.trim().length > 0 &&
    typeof o.email === "string" &&
    o.email.trim().length > 0 &&
    typeof o.message === "string" &&
    o.message.trim().length > 0
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!validatePayload(body)) {
      return NextResponse.json(
        { error: "Invalid request. Name, email, and message are required." },
        { status: 400 }
      );
    }

    const payload: ContactPayload = {
      name: body.name.trim(),
      company: body.company?.trim() || undefined,
      email: body.email.trim(),
      phone: body.phone?.trim() || undefined,
      message: body.message.trim(),
    };

    const apiKey = process.env.RESEND_API_KEY;
    const businessEmail = process.env.BUSINESS_EMAIL;
    const fromEmail = process.env.EMAIL_FROM;

    if (!apiKey || !businessEmail || !fromEmail) {
      console.log("[Contact form submission]", payload);
      return NextResponse.json({ ok: true });
    }

    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: fromEmail,
      to: businessEmail,
      replyTo: payload.email,
      subject: `Contact: ${payload.name}${payload.company ? ` (${payload.company})` : ""}`,
      html: buildContactEmailHtml(payload),
    });

    if (result.error) {
      console.error("[Contact email error]", result.error);
      return NextResponse.json(
        { error: "Failed to send message. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Contact API error]", e);
    return NextResponse.json(
      { error: "Invalid request or server error." },
      { status: 400 }
    );
  }
}
