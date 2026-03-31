import { clampAngleDeg } from "@/lib/panelBends";
import type { BoxTrayEdge, BoxTraySideRow } from "@/types/boxTray";

const MAX_FLANGE_IN = 120;

/** Max tray returns in the configurator (one per panel edge in typical use; same edge may repeat for stacked returns). */
export const MAX_TRAY_SIDE_ROWS = 4;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

const VALID_EDGES: BoxTrayEdge[] = ["south", "north", "west", "east"];

function isBoxTrayEdge(x: unknown): x is BoxTrayEdge {
  return typeof x === "string" && (VALID_EDGES as string[]).includes(x);
}

/**
 * Shared bend sign for all rows: follow Side 1 and Side 2. If they disagree, Side 1 wins.
 * If both are 0°, defaults to +1 (outward / positive angles).
 */
function bendReferenceSignFromSides1And2(a0: number, a1: number): number {
  const s0 = a0 === 0 ? 0 : Math.sign(a0);
  const s1 = a1 === 0 ? 0 : Math.sign(a1);
  if (s0 !== 0 && s1 !== 0 && s0 !== s1) return s0;
  if (s0 !== 0) return s0;
  if (s1 !== 0) return s1;
  return 1;
}

/**
 * Clamps each row; **preserves order** and **allows duplicate edges**.
 * Every non-zero angle uses the **same sign** as Sides 1–2 (magnitude per row is kept).
 */
export function normalizeBoxTraySides(raw: BoxTraySideRow[]): BoxTraySideRow[] {
  type RowTmp = { row: BoxTraySideRow; h: number; a: number };
  const tmp: RowTmp[] = [];
  for (const row of raw) {
    if (!isBoxTrayEdge(row.edge)) continue;
    const h = round2(Math.min(MAX_FLANGE_IN, Math.max(0.01, Number(row.flangeHeightIn) || 0.01)));
    const a = clampAngleDeg(Number(row.angleDeg) || 0);
    tmp.push({ row, h, a });
  }
  const sliced = tmp.slice(0, MAX_TRAY_SIDE_ROWS);
  const a0 = sliced[0]?.a ?? 0;
  const a1 = sliced[1]?.a ?? 0;
  const refSign = bendReferenceSignFromSides1And2(a0, a1);

  return sliced.map(({ row, h, a }) => ({
    ...row,
    flangeHeightIn: h,
    angleDeg: a === 0 ? 0 : clampAngleDeg(refSign * Math.abs(a)),
  }));
}

export function formatBoxTraySummary(sides: BoxTraySideRow[]): string {
  if (!sides.length) return "";
  const labels: Record<BoxTrayEdge, string> = {
    south: "S",
    north: "N",
    east: "E",
    west: "W",
  };
  const parts = sides.map(
    (s) =>
      `${labels[s.edge]} ${s.flangeHeightIn}"@${Number.isInteger(s.angleDeg) ? s.angleDeg : s.angleDeg.toFixed(1)}°`
  );
  return `Box sides: ${parts.join(" · ")}`;
}
