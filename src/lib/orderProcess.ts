/** Same narrative as checkout “Order process” — single source of truth. */
export const ORDER_PROCESS_STEPS = [
  "We receive your order.",
  "A copy is sent to us at premiercladdingsolutions@gmail.com.",
  "Email confirmation is sent to you.",
  "We check inventory and prepare your estimate.",
  "We send you the finalized cost for your signature.",
  "We order materials and ship to our shop.",
  "Panels are fabricated.",
  "Once complete, you have 5 business days to pay the final deposit.",
  "Upon receipt of payment, we ship to you.",
] as const;

/** 1 calendar week: estimating, finalized cost, signature / deposit. */
export const ORDER_FINALIZATION_CALENDAR_DAYS = 7;

/** 1 calendar week: order materials and receive at the shop. */
export const MATERIAL_LEAD_CALENDAR_DAYS = 7;

/** Shop capacity for timeline estimates (panels per calendar day). */
export const PANELS_PER_PRODUCTION_DAY = 50;

/** 1 calendar week: transit to customer after fabrication. */
export const SHIPPING_CALENDAR_DAYS = 7;

export function fabricationCalendarDays(panelQty: number): number {
  const q = Math.max(0, Math.floor(panelQty));
  if (q < 1) return 0;
  return Math.ceil(q / PANELS_PER_PRODUCTION_DAY);
}

export type OrderTimelinePlan = {
  orderFinalizationDays: number;
  materialLeadDays: number;
  fabricationDays: number;
  shippingDays: number;
  totalDays: number;
};

/**
 * End-to-end illustrative timeline from order quantity (panels in this line).
 * Order finalization + material lead + fabrication (50 panels/day) + shipping.
 */
export function planOrderTimelineDays(panelQty: number): OrderTimelinePlan {
  const orderFinalizationDays = ORDER_FINALIZATION_CALENDAR_DAYS;
  const materialLeadDays = MATERIAL_LEAD_CALENDAR_DAYS;
  const fabricationDays = fabricationCalendarDays(panelQty);
  const shippingDays = SHIPPING_CALENDAR_DAYS;
  return {
    orderFinalizationDays,
    materialLeadDays,
    fabricationDays,
    shippingDays,
    totalDays: orderFinalizationDays + materialLeadDays + fabricationDays + shippingDays,
  };
}
