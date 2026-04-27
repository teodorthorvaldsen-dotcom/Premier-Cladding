export type PortalOrderSection = "new" | "in_production" | "finished";

export const PORTAL_ORDER_SECTIONS: PortalOrderSection[] = ["new", "in_production", "finished"];

export const PORTAL_ORDER_SECTION_LABEL: Record<PortalOrderSection, string> = {
  new: "New",
  in_production: "In production",
  finished: "Finished",
};

export type OrderStatusForSection = "Pending" | "In Production" | "Completed" | "Shipped";

export function isPortalOrderSection(s: string): s is PortalOrderSection {
  return (PORTAL_ORDER_SECTIONS as readonly string[]).includes(s as PortalOrderSection);
}

export function defaultPortalOrderSection(order: { status: OrderStatusForSection }): PortalOrderSection {
  if (order.status === "Completed" || order.status === "Shipped") return "finished";
  if (order.status === "In Production") return "in_production";
  return "new";
}

export function resolvePortalOrderSection(
  order: { id: string; status: OrderStatusForSection },
  persisted: Record<string, PortalOrderSection | undefined>
): PortalOrderSection {
  const p = persisted[order.id];
  if (p && isPortalOrderSection(p)) return p;
  return defaultPortalOrderSection(order);
}
