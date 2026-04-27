import { colors } from "@/data/acm";
import type { SessionUser } from "@/lib/auth";
import { demoOrders, getDemoOrderById, type OrderRecord } from "@/lib/demoData";
import type { JobStage } from "@/lib/jobStage";
import { resolveJobStage } from "@/lib/jobStage";
import { resolvePortalOrderSection } from "@/lib/portalOrderSection";
import {
  loadDynamicOrders,
  loadPersistedJobStages,
  loadPersistedPortalOrderSections,
} from "@/lib/portalPersistence";
import type { CartItem } from "@/types/cart";

export function enrichPortalOrder(
  order: OrderRecord,
  jobStages?: Record<string, JobStage>,
  portalSections?: ReturnType<typeof loadPersistedPortalOrderSections>
): OrderRecord {
  const stages = jobStages ?? loadPersistedJobStages();
  const sections = portalSections ?? loadPersistedPortalOrderSections();
  const jobStage = resolveJobStage(order, stages[order.id]);
  const withStage: OrderRecord = { ...order, jobStage };
  const portalSection = resolvePortalOrderSection(withStage, sections);
  return { ...withStage, portalSection };
}

export type CartQuoteItemLike = {
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
};

export function getPortalOrderById(orderId: string): OrderRecord | undefined {
  const raw = getDemoOrderById(orderId) ?? loadDynamicOrders().find((o) => o.id === orderId);
  return raw ? enrichPortalOrder(raw) : undefined;
}

export function getPortalOrdersForUser(user: SessionUser): OrderRecord[] {
  const dynamic = loadDynamicOrders();
  if (user.role === "subcontractor" || user.role === "admin") {
    const byId = new Map<string, OrderRecord>();
    demoOrders.forEach((o) => byId.set(o.id, o));
    dynamic.forEach((o) => byId.set(o.id, o));
    const stages = loadPersistedJobStages();
    const sections = loadPersistedPortalOrderSections();
    return Array.from(byId.values())
      .map((o) => enrichPortalOrder(o, stages, sections))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  const demo = demoOrders.filter((o) => o.customerId === user.customerId);
  const dyn = dynamic.filter(
    (o) =>
      o.customerId === user.customerId ||
      o.customerEmail.trim().toLowerCase() === user.email.trim().toLowerCase()
  );
  const byId = new Map<string, OrderRecord>();
  [...demo, ...dyn].forEach((o) => byId.set(o.id, o));
  const stages = loadPersistedJobStages();
  const sections = loadPersistedPortalOrderSections();
  return Array.from(byId.values())
    .map((o) => enrichPortalOrder(o, stages, sections))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function cartQuoteItemToCartItem(raw: CartQuoteItemLike, lineId: string): CartItem {
  const { id: _drop, ...rest } = raw as CartQuoteItemLike & { id?: string };
  return { ...(rest as Omit<CartItem, "id">), id: lineId };
}

export function buildPortalOrderFromCartQuote(input: {
  orderId: string;
  customerId: string;
  payload: {
    fullName: string;
    company: string;
    email: string;
    phone: string;
    projectCity: string;
    projectState: string;
  };
  items: CartQuoteItemLike[];
}): OrderRecord {
  const first = input.items[0];
  const lineId = `${input.orderId}-line`;
  const lineItem = cartQuoteItemToCartItem(first, lineId);
  const colorName = colors.find((c) => c.id === first.colorId)?.name ?? first.colorId;
  const projectName =
    input.items.length > 1
      ? `Cart quote (${input.items.length} line items)`
      : first.panelTypeLabel ?? "Quote request";

  return {
    id: input.orderId,
    customerId: input.customerId,
    customerName: input.payload.fullName.trim(),
    companyName: input.payload.company.trim() || "—",
    customerEmail: input.payload.email.trim(),
    customerPhone: input.payload.phone.trim() || "—",
    shippingAddress: {
      line1: "As provided at checkout",
      line2: undefined,
      city: input.payload.projectCity.trim() || "—",
      state: input.payload.projectState.trim() || "—",
      postalCode: "—",
    },
    status: "Pending",
    createdAt: new Date().toISOString().slice(0, 10),
    projectName,
    measurements: {
      width: first.widthIn,
      height: first.heightIn,
      unit: "in",
    },
    material: "ACM",
    color: colorName,
    previewImageSrc: "/portal-orders/ord-1001-preview.svg",
    lineItem,
  };
}
