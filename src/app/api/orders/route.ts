import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { Resend } from "resend";
import { appendOrder, listOrders, type StoredOrder } from "@/lib/ordersPersistence";

export const runtime = "nodejs";

const ORDER_COPY_EMAIL = "premiercladdingsolutions@gmail.com";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildOrderEmailHtml(order: StoredOrder): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #333; max-width: 640px;">
  <h2 style="margin-bottom: 0.25em;">New Order Submitted</h2>
  <p style="margin-top: 0; color: #666;">Order ID: <strong>${escapeHtml(order.id)}</strong></p>

  <h3 style="margin-top: 1.5em; margin-bottom: 0.5em; font-size: 1em;">Customer</h3>
  <table style="border-collapse: collapse;">
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Name</td><td>${escapeHtml(order.customer_name)}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Email</td><td><a href="mailto:${escapeHtml(order.customer_email)}">${escapeHtml(order.customer_email)}</a></td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Phone</td><td>${escapeHtml(order.customer_phone ?? "-")}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color: #666;">Company</td><td>${escapeHtml(order.company_name ?? "-")}</td></tr>
  </table>

  <h3 style="margin-top: 1.5em; margin-bottom: 0.5em; font-size: 1em;">Order</h3>
  <p style="margin: 0.25em 0;"><strong>${escapeHtml(order.order_title)}</strong></p>
  <pre style="margin-top: 0.75em; padding: 12px; background: #f8f9fa; border-radius: 10px; white-space: pre-wrap; word-break: break-word;">${escapeHtml(order.order_details)}</pre>

  <p style="margin-top: 1.25em; color: #666; font-size: 0.9em;">Status: ${escapeHtml(order.order_status)} · Created: ${escapeHtml(order.created_at)}</p>
</body>
</html>
`;
}

export async function GET() {
  return NextResponse.json({ orders: listOrders() });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as
      | null
      | {
          customerName?: unknown;
          customerEmail?: unknown;
          customerPhone?: unknown;
          companyName?: unknown;
          orderTitle?: unknown;
          orderDetails?: unknown;
        };

    const customerName = typeof body?.customerName === "string" ? body.customerName.trim() : "";
    const customerEmail = typeof body?.customerEmail === "string" ? body.customerEmail.trim() : "";
    const customerPhone = typeof body?.customerPhone === "string" ? body.customerPhone.trim() : "";
    const companyName = typeof body?.companyName === "string" ? body.companyName.trim() : "";
    const orderTitle = typeof body?.orderTitle === "string" ? body.orderTitle.trim() : "";
    const orderDetails = typeof body?.orderDetails === "string" ? body.orderDetails.trim() : "";

    if (!customerName || !customerEmail.includes("@") || !orderTitle || !orderDetails) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const order: StoredOrder = {
      id: `ORD-${randomUUID()}`,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone || null,
      company_name: companyName || null,
      order_title: orderTitle,
      order_details: orderDetails,
      order_status: "New",
      created_at: new Date().toISOString(),
    };

    try {
      appendOrder(order);
    } catch (e) {
      console.error("[orders persist]", e);
      return NextResponse.json({ error: "Failed to save order." }, { status: 500 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM;
    const businessRecipients = Array.from(
      new Set([process.env.BUSINESS_EMAIL, ORDER_COPY_EMAIL].filter(Boolean))
    ) as string[];

    let emailSent = false;
    if (apiKey && fromEmail) {
      const resend = new Resend(apiKey);
      const html = buildOrderEmailHtml(order);
      const [businessResult, customerResult] = await Promise.all([
        resend.emails.send({
          from: fromEmail,
          to: businessRecipients,
          subject: `New Order: ${order.order_title}`,
          html,
        }),
        resend.emails.send({
          from: fromEmail,
          to: order.customer_email,
          subject: "Order Received – Premier Cladding",
          html,
        }),
      ]);

      if (businessResult.error || customerResult.error) {
        const err = businessResult.error ?? customerResult.error;
        console.error("[orders email]", err);
        return NextResponse.json({ error: "Order saved but email failed to send." }, { status: 500 });
      }
      emailSent = true;
    } else {
      console.warn("[orders] Email not sent: set RESEND_API_KEY and EMAIL_FROM.", {
        orderId: order.id,
        businessRecipients,
      });
    }

    return NextResponse.json({ ok: true, order, emailSent });
  } catch (e) {
    console.error("[orders API error]", e);
    return NextResponse.json({ error: "Invalid request or server error." }, { status: 400 });
  }
}

