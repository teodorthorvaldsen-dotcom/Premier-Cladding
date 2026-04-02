import { clampAngleDeg } from "@/lib/panelBends";
import type { BoxTrayEdge, BoxTraySideRow } from "@/types/boxTray";

const MAX_FLANGE_IN = 120;

/** Configurator + preview allow many rows; multiple rows may appear when cycling slots (stacked returns). */
export const MAX_TRAY_SIDE_ROWS = 16;

/** List position → edge: Side 1 front, 2 back, 3 left, 4 right, then repeats for row 5+. */
export const TRAY_SLOT_EDGE_ORDER: BoxTrayEdge[] = ["south", "north", "west", "east"];

export function trayEdgeForSlotIndex(slotIndex: number): BoxTrayEdge {
  return TRAY_SLOT_EDGE_ORDER[slotIndex % TRAY_SLOT_EDGE_ORDER.length]!;
}

/** Default bend for every tray return slot (+90°, same for all edges). */
export function trayDefaultAngleDegForSlot(_slotIndex: number): number {
  return 90;
}

function newTraySideId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `bx-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** One return per slot: 1″ @ +90° on each edge. */
export function defaultFullTraySides(): BoxTraySideRow[] {
  return [0, 1, 2, 3].map((i) => ({
    id: newTraySideId(),
    edge: trayEdgeForSlotIndex(i),
    flangeHeightIn: 1,
    angleDeg: trayDefaultAngleDegForSlot(i),
  }));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Clamps each row, **preserves order**, assigns **edge from list index** (Side 1→front … Side 4→right, then repeats).
 */
export function normalizeBoxTraySides(raw: BoxTraySideRow[]): BoxTraySideRow[] {
  const out: BoxTraySideRow[] = [];
  for (const row of raw) {
    if (row == null || typeof row !== "object") continue;
    const idx = out.length;
    const edge = trayEdgeForSlotIndex(idx);
    const h = round2(Math.min(MAX_FLANGE_IN, Math.max(0.01, Number(row.flangeHeightIn) || 0.01)));
    let a = clampAngleDeg(Number(row.angleDeg) || 0);
    if ((edge === "west" || edge === "east") && a === -90) {
      a = 90;
    }
    const id =
      typeof (row as BoxTraySideRow).id === "string" && (row as BoxTraySideRow).id.length > 0
        ? (row as BoxTraySideRow).id
        : newTraySideId();
    out.push({ id, edge, flangeHeightIn: h, angleDeg: a });
    if (out.length >= MAX_TRAY_SIDE_ROWS) break;
  }
  return out;
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
