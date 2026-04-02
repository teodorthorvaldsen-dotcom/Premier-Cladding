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

const VALID_EDGES: BoxTrayEdge[] = ["south", "north", "west", "east"];

function isBoxTrayEdge(x: unknown): x is BoxTrayEdge {
  return typeof x === "string" && (VALID_EDGES as string[]).includes(x);
}

/**
 * Clamps each row, **preserves order**, keeps **`edge` from the row** when valid so stacked folds on Side 1–4 stay on the same edge.
 * If `edge` is missing or invalid, falls back to the legacy slot pattern (Side 1→front …).
 */
export function normalizeBoxTraySides(raw: BoxTraySideRow[]): BoxTraySideRow[] {
  const out: BoxTraySideRow[] = [];
  for (const row of raw) {
    if (row == null || typeof row !== "object") continue;
    const idx = out.length;
    const edge = isBoxTrayEdge(row.edge) ? row.edge : trayEdgeForSlotIndex(idx);
    const h = round2(Math.min(MAX_FLANGE_IN, Math.max(0.01, Number(row.flangeHeightIn) || 0.01)));
    const a = clampAngleDeg(Number(row.angleDeg) || 0);
    const id =
      typeof (row as BoxTraySideRow).id === "string" && (row as BoxTraySideRow).id.length > 0
        ? (row as BoxTraySideRow).id
        : newTraySideId();
    const rawParent = (row as BoxTraySideRow).parentId;
    let parentId: string | undefined;
    if (typeof rawParent === "string" && rawParent.length > 0) {
      const parentRow = out.find((r) => r.id === rawParent);
      if (parentRow && parentRow.edge === edge) parentId = rawParent;
    }
    out.push({ id, edge, flangeHeightIn: h, angleDeg: a, ...(parentId ? { parentId } : {}) });
    if (out.length >= MAX_TRAY_SIDE_ROWS) break;
  }
  return out;
}

/**
 * Display titles for the configurator and 3D labels: roots are `Side 1`, `Side 2`, … (by root order);
 * stacked returns are `Side N, Fold 1`, `Side N, Fold 2`, … (depth along the parent chain).
 */
export function trayFoldRowTitles(sides: BoxTraySideRow[]): string[] {
  const rootIdsInOrder: string[] = [];
  for (const s of sides) {
    if (!s.parentId) rootIdsInOrder.push(s.id);
  }
  const rootOrdinalById = new Map<string, number>();
  rootIdsInOrder.forEach((id, i) => rootOrdinalById.set(id, i + 1));

  const parentIndex = (rowIndex: number): number => {
    const pid = sides[rowIndex]?.parentId;
    if (typeof pid !== "string" || !pid.length) return -1;
    return sides.findIndex((x) => x.id === pid);
  };

  const rootIdForIndex = (rowIndex: number): string => {
    let i = rowIndex;
    const seen = new Set<string>();
    for (;;) {
      const row = sides[i];
      if (!row) return sides[rowIndex]!.id;
      if (seen.has(row.id)) return row.id;
      seen.add(row.id);
      const pi = parentIndex(i);
      if (pi < 0) return row.id;
      i = pi;
    }
  };

  const depthFromRoot = (rowIndex: number): number => {
    let d = 0;
    let i = rowIndex;
    const seen = new Set<string>();
    for (;;) {
      const pi = parentIndex(i);
      if (pi < 0) return d;
      if (seen.has(sides[i]!.id)) return d;
      seen.add(sides[i]!.id);
      d++;
      i = pi;
    }
  };

  return sides.map((_, i) => {
    const rid = rootIdForIndex(i);
    const sn = rootOrdinalById.get(rid) ?? i + 1;
    const depth = depthFromRoot(i);
    if (depth === 0) return `Side ${sn}`;
    return `Side ${sn}, Fold ${depth}`;
  });
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
