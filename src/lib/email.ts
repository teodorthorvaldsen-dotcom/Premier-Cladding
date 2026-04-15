import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type OrderEmailInput = {
  customerName: string;
  customerEmail: string;
  company?: string;
  phone?: string;
  projectName?: string;
  notes?: string;
  orderId: string;
  items?: Array<{
    name: string;
    quantity: number;
    price?: number;
  }>;
  total?: number;
  /** Wire / credit, etc. */
  paymentMethod?: string;
  /** E-signature text from checkout */
  signature?: string;
};

function formatCurrency(value?: number) {
  if (typeof value !== "number") return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function buildItemsTable(items?: Array<{ name: string; quantity: number; price?: number }>) {
  if (!items || items.length === 0) {
    return `<p>No line items were included.</p>`;
  }

  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px;border:1px solid #ddd;">${escapeHtml(item.name)}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right;">${formatCurrency(item.price)}</td>
        </tr>
      `
    )
    .join("");

  return `
    <table style="width:100%;border-collapse:collapse;margin-top:12px;">
      <thead>
        <tr>
          <th style="padding:8px;border:1px solid #ddd;text-align:left;">Item</th>
          <th style="padding:8px;border:1px solid #ddd;text-align:center;">Qty</th>
          <th style="padding:8px;border:1px solid #ddd;text-align:right;">Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

export async function sendNewOrderNotification(order: OrderEmailInput) {
  const to = process.env.ORDER_NOTIFICATION_EMAIL;
  const from = process.env.EMAIL_FROM;

  if (!process.env.RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY");
  }

  if (!from) {
    throw new Error("Missing EMAIL_FROM");
  }

  if (!to) {
    throw new Error("Missing ORDER_NOTIFICATION_EMAIL");
  }

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;color:#111;">
      <h2>New order received</h2>
      <p>A new order was submitted on your website.</p>

      <div style="margin:16px 0;padding:16px;border:1px solid #ddd;border-radius:8px;">
        <p><strong>Order ID:</strong> ${escapeHtml(order.orderId)}</p>
        <p><strong>Customer:</strong> ${escapeHtml(order.customerName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(order.customerEmail)}</p>
        <p><strong>Company:</strong> ${escapeHtml(order.company || "N/A")}</p>
        <p><strong>Phone:</strong> ${escapeHtml(order.phone || "N/A")}</p>
        <p><strong>Project:</strong> ${escapeHtml(order.projectName || "N/A")}</p>
        <p><strong>Notes:</strong> ${escapeHtml(order.notes || "N/A")}</p>
        ${order.paymentMethod ? `<p><strong>Payment:</strong> ${escapeHtml(order.paymentMethod)}</p>` : ""}
        ${order.signature ? `<p><strong>Signature:</strong> ${escapeHtml(order.signature)}</p>` : ""}
        <p><strong>Total:</strong> ${formatCurrency(order.total)}</p>
      </div>

      <h3>Order items</h3>
      ${buildItemsTable(order.items)}
    </div>
  `;

  return await resend.emails.send({
    from,
    to,
    replyTo: order.customerEmail,
    subject: `New Order Received - ${order.orderId}`,
    html,
  });
}

export async function sendCustomerOrderConfirmation(order: OrderEmailInput) {
  const from = process.env.EMAIL_FROM;

  if (!process.env.RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY");
  }

  if (!from) {
    throw new Error("Missing EMAIL_FROM");
  }

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;color:#111;">
      <h2>Thank you for your order</h2>
      <p>Hi ${escapeHtml(order.customerName)},</p>
      <p>We received your order request and our team will review it shortly.</p>

      <div style="margin:16px 0;padding:16px;border:1px solid #ddd;border-radius:8px;">
        <p><strong>Order ID:</strong> ${escapeHtml(order.orderId)}</p>
        <p><strong>Project:</strong> ${escapeHtml(order.projectName || "N/A")}</p>
        <p><strong>Total:</strong> ${formatCurrency(order.total)}</p>
      </div>

      <h3>Items submitted</h3>
      ${buildItemsTable(order.items)}

      <p style="margin-top:20px;">If you have questions, just reply to this email.</p>
    </div>
  `;

  return await resend.emails.send({
    from,
    to: order.customerEmail,
    subject: `Order Confirmation - ${order.orderId}`,
    html,
  });
}
