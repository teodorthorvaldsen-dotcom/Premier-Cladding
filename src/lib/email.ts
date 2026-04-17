import { Resend } from "resend";

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM && process.env.ADMIN_EMAIL);
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is missing");
  }

  return new Resend(apiKey);
}

export async function sendOrderEmails({
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  companyName,
  orderTitle,
  orderDetails,
  createdAt,
}: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  companyName?: string;
  orderTitle: string;
  orderDetails: string;
  createdAt: string;
}) {
  const from = process.env.EMAIL_FROM;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!from) throw new Error("EMAIL_FROM is missing");
  if (!adminEmail) throw new Error("ADMIN_EMAIL is missing");

  const resend = getResendClient();

  const subject = `Order Confirmation - ${orderTitle} (${orderId.slice(0, 8)})`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Order Confirmation</h2>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Date:</strong> ${createdAt}</p>
      <p><strong>Customer Name:</strong> ${customerName}</p>
      <p><strong>Customer Email:</strong> ${customerEmail}</p>
      <p><strong>Phone:</strong> ${customerPhone || "-"}</p>
      <p><strong>Company:</strong> ${companyName || "-"}</p>
      <p><strong>Order Title:</strong> ${orderTitle}</p>
      <p><strong>Order Details:</strong></p>
      <div style="padding:12px;background:#f7f7f7;border-radius:8px;white-space:pre-wrap;">
        ${orderDetails}
      </div>
    </div>
  `;

  await resend.emails.send({
    from,
    to: customerEmail,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Hi ${customerName},</p>
        <p>Thank you for your order. A copy of your submission is below.</p>
        ${html}
      </div>
    `,
  });

  await resend.emails.send({
    from,
    to: adminEmail,
    subject: `Admin Copy - ${subject}`,
    html,
    replyTo: customerEmail,
  });
}

export async function sendStatusUpdateEmails(payload: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  orderTitle: string;
  previousStatus: string;
  newStatus: string;
  adminNotes?: string;
}) {
  const resend = getResendClient();

  const from = process.env.EMAIL_FROM;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!from) {
    throw new Error("EMAIL_FROM is missing");
  }

  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL is missing");
  }

  const subject = `Order Update - ${payload.orderTitle} is now ${payload.newStatus}`;

  const customerHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Your order has been updated</h2>
      <p>Hi ${payload.customerName},</p>
      <p>Your order status has changed.</p>

      <p><strong>Order ID:</strong> ${payload.orderId}</p>
      <p><strong>Order Title:</strong> ${payload.orderTitle}</p>
      <p><strong>Previous Status:</strong> ${payload.previousStatus}</p>
      <p><strong>New Status:</strong> ${payload.newStatus}</p>

      ${
        payload.adminNotes
          ? `
        <p><strong>Additional Notes:</strong></p>
        <div style="padding: 12px; background: #f7f7f7; border-radius: 8px; white-space: pre-wrap;">
          ${payload.adminNotes}
        </div>
      `
          : ""
      }

      <p>If you have any questions, reply to this email.</p>
    </div>
  `;

  const adminHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Admin Status Update Copy</h2>
      <p><strong>Order ID:</strong> ${payload.orderId}</p>
      <p><strong>Customer:</strong> ${payload.customerName}</p>
      <p><strong>Customer Email:</strong> ${payload.customerEmail}</p>
      <p><strong>Order Title:</strong> ${payload.orderTitle}</p>
      <p><strong>Previous Status:</strong> ${payload.previousStatus}</p>
      <p><strong>New Status:</strong> ${payload.newStatus}</p>
      <p><strong>Notes:</strong> ${payload.adminNotes || "-"}</p>
    </div>
  `;

  await resend.emails.send({
    from,
    to: payload.customerEmail,
    subject,
    html: customerHtml,
    replyTo: adminEmail,
  });

  await resend.emails.send({
    from,
    to: adminEmail,
    subject: `Admin Copy - ${subject}`,
    html: adminHtml,
    replyTo: payload.customerEmail,
  });
}

