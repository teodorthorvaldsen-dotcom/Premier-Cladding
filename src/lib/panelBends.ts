import type { CartItem } from "@/types/cart";
import type { BendReferenceAlong, PanelBendSpec } from "@/types/panelBend";

/** Loose row shape (e.g. form JSON or CSV) before normalization with {@link normalizeBendsFromRows}. */
export type LooseBendRow = {
  inchesFromEdge: number | string;
  angleDeg: number | string;
  referenceAlong?: string;
};

/** Minimum clear distance from any fold line to the end of the panel along length (inches). */
export const PANEL_BEND_MIN_LEG_IN = 0.5;

export type { BendReferenceAlong, PanelBendSpec };

/** Position of the fold line from the start of the dimension (0″ end), in inches — used by the 3D path. */
export function canonicalBendPosition(b: PanelBendSpec, extentIn: number): number {
  const L = extentIn;
  const d = b.inchesFromEdge;
  if (b.referenceAlong === "fromEnd") return L - d;
  return d;
}

function roundInches(n: number): number {
  return Math.round(n * 100) / 100;
}

export function displayInchesForReference(canonicalFromStart: number, ref: BendReferenceAlong, extentIn: number): number {
  if (ref === "fromEnd") return roundInches(extentIn - canonicalFromStart);
  return roundInches(canonicalFromStart);
}

/**
 * Parses `referenceAlong` for {@link PanelBendSpec}.
 * Use `fromStart` / `fromEnd` only; length vs width is determined by which list the bend belongs to, not this field.
 */
export function parseBendReferenceAlong(value: unknown): BendReferenceAlong | undefined {
  if (value === "fromEnd" || value === "end" || value === "opposite") return "fromEnd";
  if (value === "fromStart" || value === "start" || value === "leading") return "fromStart";
  return undefined;
}

/** Coerces loose rows (strings, optional reference) into panel bend specs. Does not run leg-spacing normalization. */
export function normalizeBendsFromRows(rows: LooseBendRow[]): PanelBendSpec[] {
  return rows.map((row): PanelBendSpec => {
    const ref = parseBendReferenceAlong(row.referenceAlong);
    const base: PanelBendSpec = {
      inchesFromEdge: Number(row.inchesFromEdge) || 0,
      angleDeg: Number(row.angleDeg) || 0,
    };
    return ref !== undefined ? { ...base, referenceAlong: ref } : base;
  });
}

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

  type Item = { ref: BendReferenceAlong; p: number; angleDeg: number };

  const items: Item[] = [...raw]
    .map((b) => {
      const ref: BendReferenceAlong = b.referenceAlong === "fromEnd" ? "fromEnd" : "fromStart";
      let p = roundInches(b.inchesFromEdge);
      if (ref === "fromEnd") p = roundInches(L - p);
      return { ref, p, angleDeg: clampAngleDeg(b.angleDeg) };
    })
    .sort((a, b) => a.p - b.p);

  const out: Item[] = [];
  let prevEdge = 0;

  for (const b of items) {
    let pos = b.p;
    pos = Math.max(pos, prevEdge + lo);
    pos = Math.min(pos, hi);
    if (L - pos < lo - 1e-9) break;
    if (out.length > 0 && Math.abs(pos - out[out.length - 1].p) < 1e-6) {
      out[out.length - 1] = { ref: b.ref, p: pos, angleDeg: b.angleDeg };
      prevEdge = pos;
      continue;
    }
    out.push({ ref: b.ref, p: pos, angleDeg: b.angleDeg });
    prevEdge = pos;
  }

  while (out.length > 0 && L - out[out.length - 1].p < lo - 1e-9) {
    out.pop();
  }

  return out.map((o) => ({
    referenceAlong: o.ref,
    inchesFromEdge: displayInchesForReference(o.p, o.ref, L),
    angleDeg: o.angleDeg,
  }));
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

  const breakpoints = [0, ...normalized.map((b) => canonicalBendPosition(b, L)), L];
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

function refLabel(b: PanelBendSpec): string {
  return b.referenceAlong === "fromEnd" ? "end" : "start";
}

export function formatPanelBendsSummary(bends: PanelBendSpec[]): string {
  if (!bends.length) return "";
  const parts = bends.map((b) => {
    const a = Number.isInteger(b.angleDeg) ? String(b.angleDeg) : b.angleDeg.toFixed(1);
    return `${b.inchesFromEdge}" from ${refLabel(b)} @ ${a}°`;
  });
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
  return [{ inchesFromEdge: inches, angleDeg: bendAngleDeg, referenceAlong: "fromStart" }];
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
