import type { CartItem } from "@/types/cart";
import type { PanelBendSpec } from "@/types/panelBend";

/** Minimum clear distance from any fold line to the end of the panel along length (inches). */
export const PANEL_BEND_MIN_LEG_IN = 0.5;

export type { PanelBendSpec };

const MAX_BENDS_CAP = 20;

/** Max interior fold lines along a panel edge dimension (length or width), each leg ≥ min. */
export function maxPanelBendsAlongDimension(panelExtentIn: number): number {
  const L = panelExtentIn;
  const lo = PANEL_BEND_MIN_LEG_IN;
  if (L < 2 * lo + 1e-9) return 0;
  const n = Math.floor(L / lo) - 1;
  return Math.min(MAX_BENDS_CAP, Math.max(0, n));
}

export function maxPanelBendsForLength(lengthIn: number): number {
  return maxPanelBendsAlongDimension(lengthIn);
}

export function maxPanelBendsForWidth(widthIn: number): number {
  return maxPanelBendsAlongDimension(widthIn);
}

function clampAngleDeg(val: number): number {
  const n = Math.round(val * 10) / 10;
  if (Number.isNaN(n) || n < 0) return 0;
  return Math.min(180, n);
}

/**
 * Sorts folds along an edge (length or width), enforces minimum leg between folds and to each end.
 */
export function normalizePanelBends(raw: PanelBendSpec[], alongDimensionIn: number): PanelBendSpec[] {
  const L = alongDimensionIn;
  const lo = PANEL_BEND_MIN_LEG_IN;
  const hi = Math.max(lo, L - lo);
  if (hi <= lo || raw.length === 0) return [];

  const sorted = [...raw]
    .map((b) => ({
      inchesFromEdge: Math.round(b.inchesFromEdge * 100) / 100,
      angleDeg: clampAngleDeg(b.angleDeg),
    }))
    .sort((a, b) => a.inchesFromEdge - b.inchesFromEdge);

  const out: PanelBendSpec[] = [];
  let prevEdge = 0;

  for (const b of sorted) {
    let pos = b.inchesFromEdge;
    pos = Math.max(pos, prevEdge + lo);
    pos = Math.min(pos, hi);
    if (L - pos < lo - 1e-9) break;
    if (out.length > 0 && Math.abs(pos - out[out.length - 1].inchesFromEdge) < 1e-6) {
      out[out.length - 1] = { inchesFromEdge: pos, angleDeg: b.angleDeg };
      prevEdge = pos;
      continue;
    }
    out.push({ inchesFromEdge: pos, angleDeg: b.angleDeg });
    prevEdge = pos;
  }

  while (out.length > 0 && L - out[out.length - 1].inchesFromEdge < lo - 1e-9) {
    out.pop();
  }

  return out;
}

/** @deprecated Use normalizePanelBends(raw, widthIn) for width-axis folds (same math, different extent). */
export function normalizePanelBendsAlongWidth(raw: PanelBendSpec[], widthIn: number): PanelBendSpec[] {
  return normalizePanelBends(raw, widthIn);
}

/** Midpoint of the widest gap between existing folds and ends (for "add bend"). */
export function suggestNextBendInchesFromEdge(existing: PanelBendSpec[], alongDimensionIn: number): number {
  const normalized = normalizePanelBends(existing, alongDimensionIn);
  const L = alongDimensionIn;
  const lo = PANEL_BEND_MIN_LEG_IN;
  const hi = Math.max(lo, L - lo);
  if (hi <= lo) return L / 2;

  const breakpoints = [0, ...normalized.map((b) => b.inchesFromEdge), L];
  let bestMid = L / 2;
  let bestGap = 0;
  for (let i = 0; i < breakpoints.length - 1; i++) {
    const a = breakpoints[i];
    const b = breakpoints[i + 1];
    const gap = b - a;
    if (gap >= 2 * lo && gap > bestGap) {
      bestGap = gap;
      bestMid = (a + b) / 2;
    }
  }
  return Math.min(hi, Math.max(lo, Math.round(bestMid * 100) / 100));
}

export function suggestNextBendInchesAlongWidth(existing: PanelBendSpec[], widthIn: number): number {
  return suggestNextBendInchesFromEdge(existing, widthIn);
}

export function formatPanelBendsSummary(bends: PanelBendSpec[]): string {
  if (!bends.length) return "";
  const parts = bends.map((b) => `${b.inchesFromEdge}" @ ${Number.isInteger(b.angleDeg) ? b.angleDeg : b.angleDeg.toFixed(1)}°`);
  return `${bends.length} fold${bends.length === 1 ? "" : "s"}: ${parts.join(" · ")}`;
}

export function formatPanelBendsAlongWidthSummary(bends: PanelBendSpec[]): string {
  if (!bends.length) return "";
  return `Width · ${formatPanelBendsSummary(bends)}`;
}

export function panelBendsFromLegacy(
  bendAngleDeg?: number,
  bendInchesFromEdge?: number
): PanelBendSpec[] {
  if (typeof bendAngleDeg !== "number" || bendAngleDeg <= 0) return [];
  const inches =
    typeof bendInchesFromEdge === "number" && !Number.isNaN(bendInchesFromEdge)
      ? bendInchesFromEdge
      : 0;
  return [{ inchesFromEdge: inches, angleDeg: bendAngleDeg }];
}

export function getPanelBendsFromCartItem(item: CartItem): PanelBendSpec[] {
  if (item.panelBends && item.panelBends.length > 0) return item.panelBends;
  return panelBendsFromLegacy(item.bendAngleDeg, item.bendInchesFromEdge);
}

/** Resolves folds from a quote draft (new `panelBends` or legacy single-bend fields). */
export function getPanelBendsFromQuoteDraft(c: {
  panelBends?: PanelBendSpec[];
  bendAngleDeg?: number;
  bendInchesFromEdge?: number;
}): PanelBendSpec[] {
  if (c.panelBends && c.panelBends.length > 0) return c.panelBends;
  return panelBendsFromLegacy(c.bendAngleDeg, c.bendInchesFromEdge);
}
