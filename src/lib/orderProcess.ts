/** Same narrative as checkout “Order process” — single source of truth. */
export const ORDER_PROCESS_STEPS = [
  "We receive your order.",
  "A copy is sent to us at allcladdingsolutions@gmail.com.",
  "Email confirmation is sent to you.",
  "We check inventory and prepare your estimate.",
  "We send you the finalized cost for your signature.",
  "We order materials and ship to our shop.",
  "Panels are fabricated.",
  "Once complete, you have 5 business days to pay the final deposit.",
  "Upon receipt of payment, we ship to you.",
] as const;

/** Calendar days for quoting, finalizing cost, signature, and deposit before fabrication starts. */
export const ESTIMATE_AND_PAYMENT_CALENDAR_DAYS = 7;

/** Shop output for timeline estimates (panels per calendar day). */
export const PANELS_PER_PRODUCTION_DAY = 50;

export function fabricationCalendarDays(panelQty: number): number {
  const q = Math.max(0, Math.floor(panelQty));
  if (q < 1) return 0;
  return Math.ceil(q / PANELS_PER_PRODUCTION_DAY);
}

export function planTimelineDays(panelQty: number): {
  estimateDays: number;
  fabricationDays: number;
  totalDays: number;
} {
  const estimateDays = ESTIMATE_AND_PAYMENT_CALENDAR_DAYS;
  const fabricationDays = fabricationCalendarDays(panelQty);
  return {
    estimateDays,
    fabricationDays,
    totalDays: estimateDays + fabricationDays,
  };
}
