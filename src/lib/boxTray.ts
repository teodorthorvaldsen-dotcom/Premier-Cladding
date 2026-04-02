import { clampAngleDeg } from "@/lib/panelBends";
import type { BoxTrayEdge, BoxTraySideRow } from "@/types/boxTray";

const MAX_FLANGE_IN = 120;

/** Configurator + preview allow many rows; multiple rows may share the same edge (stacked returns). */
export const MAX_TRAY_SIDE_ROWS = 16;

function newTraySideId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `bx-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** One return per edge: front/back 1″ @ +90°; left/right 1″ @ −90° (reverse bend, flanges along ±X). */
export function defaultFullTraySides(): BoxTraySideRow[] {
  const edges: BoxTrayEdge[] = ["south", "north", "west", "east"];
  const angles: Record<BoxTrayEdge, number> = {
    south: 90,
    north: 90,
    west: -90,
    east: -90,
  };
  return edges.map((edge) => ({
    id: newTraySideId(),
    edge,
    flangeHeightIn: 1,
    angleDeg: angles[edge],
  }));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

const VALID_EDGES: BoxTrayEdge[] = ["south", "north", "west", "east"];

function isBoxTrayEdge(x: unknown): x is BoxTrayEdge {
  return typeof x === "string" && (VALID_EDGES as string[]).includes(x);
}

/**
 * Clamps each row; **preserves order** and **allows duplicate edges** (same edge listed multiple times = stacked flanges in 3D).
 */
export function normalizeBoxTraySides(raw: BoxTraySideRow[]): BoxTraySideRow[] {
  const out: BoxTraySideRow[] = [];
  for (const row of raw) {
    if (!isBoxTrayEdge(row.edge)) continue;
    const h = round2(Math.min(MAX_FLANGE_IN, Math.max(0.01, Number(row.flangeHeightIn) || 0.01)));
    const a = clampAngleDeg(Number(row.angleDeg) || 0);
    out.push({ ...row, flangeHeightIn: h, angleDeg: a });
  }
  return out.slice(0, MAX_TRAY_SIDE_ROWS);
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
