import { clampAngleDeg } from "@/lib/panelBends";
import type { BoxTrayEdge, BoxTraySideRow } from "@/types/boxTray";

const MAX_FLANGE_IN = 120;
const MAX_FLANGE_FLASHING_IN = 120;
const MIN_FLANGE_FLASHING_IN = 0.5;

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

function normalizeHemType(raw: unknown): "none" | "open" | "closed" | undefined {
  if (raw === "open" || raw === "closed" || raw === "none") return raw;
  return undefined;
}

function clampHemSizeIn(raw: unknown): number | undefined {
  const n = Number(raw);
  if (!Number.isFinite(n)) return undefined;
  return round2(Math.min(2, Math.max(0.25, n)));
}

const VALID_EDGES: BoxTrayEdge[] = ["south", "north", "west", "east"];

function isBoxTrayEdge(x: unknown): x is BoxTrayEdge {
  return typeof x === "string" && (VALID_EDGES as string[]).includes(x);
}

/**
 * Clamps each row, **preserves order**, keeps **`edge` from the row** when valid so stacked folds on Side 1–4 stay on the same edge.
 * If `edge` is missing or invalid, falls back to the legacy slot pattern (Side 1→front …).
 */
export function normalizeBoxTraySides(
  raw: BoxTraySideRow[],
  opts?: { maxFlangeIn?: number; minFlangeIn?: number }
): BoxTraySideRow[] {
  const maxFlangeIn =
    typeof opts?.maxFlangeIn === "number" && Number.isFinite(opts.maxFlangeIn) && opts.maxFlangeIn > 0
      ? opts.maxFlangeIn
      : MAX_FLANGE_IN;
  const minFlangeIn =
    typeof opts?.minFlangeIn === "number" && Number.isFinite(opts.minFlangeIn) && opts.minFlangeIn > 0
      ? opts.minFlangeIn
      : 0.01;
  const out: BoxTraySideRow[] = [];
  for (const row of raw) {
    if (row == null || typeof row !== "object") continue;
    const idx = out.length;
    const edge = isBoxTrayEdge(row.edge) ? row.edge : trayEdgeForSlotIndex(idx);
    const h = round2(Math.min(maxFlangeIn, Math.max(minFlangeIn, Number(row.flangeHeightIn) || minFlangeIn)));
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
    const hemType = normalizeHemType((row as BoxTraySideRow).hemType);
    const hemSizeIn = clampHemSizeIn((row as BoxTraySideRow).hemSizeIn);
    out.push({
      id,
      edge,
      flangeHeightIn: h,
      angleDeg: a,
      ...(parentId ? { parentId } : {}),
      ...(hemType ? { hemType } : {}),
      ...(hemType && hemType !== "none" && hemSizeIn ? { hemSizeIn } : {}),
    });
    if (out.length >= MAX_TRAY_SIDE_ROWS) break;
  }
  return out;
}

export function normalizeBoxTraySidesForFlashing(raw: BoxTraySideRow[]): BoxTraySideRow[] {
  // Flashing configurator supports stacked folds on Side 1 only:
  // - clamp flange height to 0.5"
  // - force all rows onto the same edge as the first row
  // - force a single linear parent chain (Side 1 → F1 → F2 → …)
  const n = normalizeBoxTraySides(raw, {
    maxFlangeIn: MAX_FLANGE_FLASHING_IN,
    minFlangeIn: MIN_FLANGE_FLASHING_IN,
  });
  if (n.length === 0) return [];
  const rootEdge = n[0]!.edge;
  const sameEdge = n.filter((r) => r.edge === rootEdge);
  return sameEdge.map((r, i) => ({
    ...r,
    edge: rootEdge,
    parentId: i === 0 ? undefined : sameEdge[i - 1]!.id,
  }));
}

function rootOrdinalMap(sides: BoxTraySideRow[]): Map<string, number> {
  const rootIdsInOrder: string[] = [];
  for (const s of sides) {
    if (!s.parentId) rootIdsInOrder.push(s.id);
  }
  const rootOrdinalById = new Map<string, number>();
  rootIdsInOrder.forEach((id, i) => rootOrdinalById.set(id, i + 1));
  return rootOrdinalById;
}

function rootIdForIndex(sides: BoxTraySideRow[], rowIndex: number): string {
  let i = rowIndex;
  const seen = new Set<string>();
  for (;;) {
    const row = sides[i];
    if (!row) return sides[rowIndex]!.id;
    if (!row.parentId) return row.id;
    if (seen.has(row.id)) return row.id;
    seen.add(row.id);
    const pi = sides.findIndex((s) => s.id === row.parentId);
    if (pi < 0) return row.id;
    i = pi;
  }
}

/** Indices from tray root row down to `rowIndex` (inclusive). */
function chainIndicesFromRoot(sides: BoxTraySideRow[], rowIndex: number): number[] {
  const up: number[] = [];
  let i: number | undefined = rowIndex;
  while (i !== undefined && i >= 0 && sides[i]) {
    up.push(i);
    const pid = sides[i]!.parentId;
    if (!pid) break;
    i = sides.findIndex((s) => s.id === pid);
    if (i < 0) break;
  }
  return up.reverse();
}

/**
 * F-index path: linear chains use F1,F2,F3 by depth; multiple folds off the same parent use sibling rank;
 * after a branch, a single-child continuation uses F1 for the first nested fold off that segment.
 */
function foldPathFNumbers(sides: BoxTraySideRow[], rowIndex: number): number[] {
  const chain = chainIndicesFromRoot(sides, rowIndex);
  if (chain.length <= 1) return [];
  const out: number[] = [];
  let onlyChildChainSinceRoot = true;
  for (let d = 1; d < chain.length; d++) {
    const idx = chain[d]!;
    const pid = sides[idx]!.parentId!;
    const sibs = sides
      .map((s, j) => (s.parentId === pid ? j : -1))
      .filter((j) => j >= 0)
      .sort((a, b) => a - b);
    const rank = sibs.indexOf(idx) + 1;
    if (d === 1) {
      out.push(rank);
      if (sibs.length > 1) onlyChildChainSinceRoot = false;
    } else if (sibs.length > 1) {
      onlyChildChainSinceRoot = false;
      out.push(rank);
    } else if (onlyChildChainSinceRoot) {
      out.push(d);
    } else {
      out.push(1);
    }
  }
  return out;
}

function formatTrayFoldTitle(rootOrdinalById: Map<string, number>, sides: BoxTraySideRow[], i: number): string {
  const row = sides[i]!;
  const sn = rootOrdinalById.get(rootIdForIndex(sides, i)) ?? i + 1;
  if (!row.parentId) return `Side ${sn}`;
  const nums = foldPathFNumbers(sides, i);
  return `Side ${sn}: ${nums.map((n) => `F${n}`).join(", ")}`;
}

/**
 * Configurator + 3D labels: `Side 2`, `Side 2: F1, F2, F3` (linear), `Side 2: F2, F1` (fold off second top fold), etc.
 */
export function trayFoldRowTitles(sides: BoxTraySideRow[]): string[] {
  const rootOrdinalById = rootOrdinalMap(sides);
  return sides.map((_, i) => formatTrayFoldTitle(rootOrdinalById, sides, i));
}

/**
 * Flashing UI uses a simple fold index list: F1, F2, F3...
 * (Flashing currently restricts folds to a single linear chain on one edge.)
 */
export function trayFoldRowTitlesForFlashing(sides: BoxTraySideRow[]): string[] {
  return sides.map((_, i) => `F${i + 1}`);
}

/** Same as {@link trayFoldRowTitles} (face text matches form). */
export function trayFoldRowPreviewLabels(sides: BoxTraySideRow[]): string[] {
  return trayFoldRowTitles(sides);
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

const EDGE_LABELS_EN: Record<BoxTrayEdge, string> = {
  south: "Front",
  north: "Back",
  west: "Left",
  east: "Right",
};

/**
 * Multi-line tray measurements: one concise row per return (edge, height, angle; nested folds note parent only).
 */
export function formatBoxTrayReproductionSpec(sides: BoxTraySideRow[]): string {
  const n = normalizeBoxTraySides(sides);
  if (!n.length) return "";
  const titles = trayFoldRowTitles(n);
  return n
    .map((row, i) => {
      const edge = EDGE_LABELS_EN[row.edge];
      const ang = Number.isInteger(row.angleDeg) ? `${row.angleDeg}` : row.angleDeg.toFixed(1);
      const sideLabel = titles[i]!;
      let line = `${sideLabel} · ${edge} · ${row.flangeHeightIn}" @ ${ang}°`;
      if (row.parentId) {
        const parentIdx = n.findIndex((r) => r.id === row.parentId);
        if (parentIdx >= 0) {
          line += ` · from ${titles[parentIdx]!}`;
        }
      }
      return line;
    })
    .join("\n");
}

/** Single-line summary for tight UI (e.g. cart description). */
export function formatBoxTrayReproductionOneLine(sides: BoxTraySideRow[]): string {
  const spec = formatBoxTrayReproductionSpec(sides);
  return spec.replace(/\n/g, " · ");
}
