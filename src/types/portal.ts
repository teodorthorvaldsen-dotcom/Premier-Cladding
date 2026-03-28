export type PortalRole = "customer" | "employee";

export type OrderStatus =
  | "submitted"
  | "in_review"
  | "in_production"
  | "ready_to_ship"
  | "shipped"
  | "completed";

export interface PortalOrder {
  id: string;
  createdAt: string;
  source: "cart_checkout" | "quote_configurator";
  status: OrderStatus;
  customerEmail: string;
  fullName: string;
  company: string;
  phone: string;
  projectCity: string;
  projectState: string;
  notes: string;
  summary: string;
  subtotalUsd: number | null;
  lineCount: number;
  /** Stored snapshot for display (cart payload or quote payload subset). */
  detail: unknown;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  submitted: "Submitted",
  in_review: "In review",
  in_production: "In production",
  ready_to_ship: "Ready to ship",
  shipped: "Shipped",
  completed: "Completed",
};

export const ORDER_STATUS_LIST: OrderStatus[] = [
  "submitted",
  "in_review",
  "in_production",
  "ready_to_ship",
  "shipped",
  "completed",
];
