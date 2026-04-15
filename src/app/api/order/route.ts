import { NextRequest, NextResponse } from "next/server";
import { describeCartLineItem } from "@/lib/describeCartLineItem";
import { sendCustomerOrderConfirmation, sendNewOrderNotification, type OrderEmailInput } from "@/lib/email";
import { buildPortalOrderFromCartQuote } from "@/lib/portalOrders";
import { registerCustomerFromQuoteAndSaveOrder } from "@/lib/portalPersistence";
import { cartItemLineTotal, type CartItem } from "@/types/cart";

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
  portalPassword: string;
}

function toCartItem(raw: CartQuoteItem): CartItem {
  return {
    id: "checkout",
    widthIn: raw.widthIn,
    heightIn: raw.heightIn,
    standardId: raw.standardId,
    colorId: raw.colorId,
    finishId: raw.finishId,
    thicknessId: raw.thicknessId,
    quantity: raw.quantity,
    unitPrice: raw.unitPrice,
    areaFt2: raw.areaFt2,
    panelType: raw.panelType,
    panelTypeLabel: raw.panelTypeLabel,
    boxTraySides: raw.boxTraySides as CartItem["boxTraySides"],
    trayBuildSpec: raw.trayBuildSpec,
    previewImageDataUrl: raw.previewImageDataUrl,
    customColorReference: raw.customColorReference,
    customColorSpecFileName: raw.customColorSpecFileName,
  };
}

function buildOrderEmailInput(payload: CartQuotePayload, orderId: string): OrderEmailInput {
  const total = payload.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const projectName = [payload.projectCity, payload.projectState].filter(Boolean).join(", ").trim();
  const paymentLabel = payload.paymentMethod === "wire" ? "Wire transfer" : "Credit card (3% fee)";
  return {
    orderId,
    customerName: payload.fullName,
    customerEmail: payload.email,
    company: payload.company,
    phone: payload.phone,
    projectName: projectName || undefined,
    notes: payload.notes || undefined,
    total,
    paymentMethod: paymentLabel,
    signature: payload.signature,
    items: payload.items.map((raw) => {
      const ci = toCartItem(raw);
      return {
        name: describeCartLineItem(ci),
        quantity: ci.quantity,
        price: cartItemLineTotal(ci),
      };
    }),
  };
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
    const portalPassword = String(body.portalPassword ?? "").trim();
    if (portalPassword.length < 8) {
      return NextResponse.json(
        { error: "Order portal password must be at least 8 characters." },
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
      portalPassword,
    };

    const orderId = `ORD-Q-${Date.now().toString(36)}`;

    try {
      const order = buildPortalOrderFromCartQuote({
        orderId,
        customerId: "pending",
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
      registerCustomerFromQuoteAndSaveOrder({
        email: payload.email,
        fullName: payload.fullName,
        company: payload.company,
        portalPassword: payload.portalPassword,
        order,
      });
    } catch (e) {
      console.error("[Order API portal persist]", e);
    }

    const emailConfigured =
      !!process.env.RESEND_API_KEY &&
      !!process.env.EMAIL_FROM &&
      !!process.env.ORDER_NOTIFICATION_EMAIL;

    let emailSent = false;

    if (emailConfigured) {
      const orderInput = buildOrderEmailInput(payload, orderId);
      try {
        const [businessResult, customerResult] = await Promise.all([
          sendNewOrderNotification(orderInput),
          sendCustomerOrderConfirmation(orderInput),
        ]);
        if (businessResult.error || customerResult.error) {
          const err = businessResult.error ?? customerResult.error;
          console.error("[Order email error]", err);
          return NextResponse.json(
            { message: "Failed to send email. Please try again.", error: String(err) },
            { status: 500 }
          );
        }
        emailSent = true;
      } catch (e) {
        console.error("[Order email exception]", e);
        return NextResponse.json(
          {
            message: e instanceof Error ? e.message : "Failed to send email. Please try again.",
          },
          { status: 500 }
        );
      }
    } else {
      console.warn(
        "[Order API] Email not sent: set RESEND_API_KEY, EMAIL_FROM, and ORDER_NOTIFICATION_EMAIL (e.g. in Vercel)."
      );
    }

    return NextResponse.json({ ok: true, orderId, emailSent });
  } catch (e) {
    console.error("[Order API error]", e);
    return NextResponse.json(
      { error: "Invalid request or server error.", message: "Invalid request or server error." },
      { status: 400 }
    );
  }
}
