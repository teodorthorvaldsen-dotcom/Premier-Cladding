import { clampAngleDeg } from "@/lib/panelBends";
import type { BoxTrayEdge, BoxTraySideRow } from "@/types/boxTray";

const MAX_FLANGE_IN = 120;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

const VALID_EDGES: BoxTrayEdge[] = ["south", "north", "west", "east"];

function isBoxTrayEdge(x: unknown): x is BoxTrayEdge {
  return typeof x === "string" && (VALID_EDGES as string[]).includes(x);
}

/**
 * One flap per physical edge; duplicate edges keep the last row in list order, earlier duplicates dropped.
 * **Preserves list order** so the configurator cards do not jump when you edit height, angle, or edge.
 */
export function normalizeBoxTraySides(raw: BoxTraySideRow[]): BoxTraySideRow[] {
  const lastIdxByEdge = new Map<BoxTrayEdge, number>();
  for (let i = 0; i < raw.length; i++) {
    const row = raw[i];
    if (!isBoxTrayEdge(row.edge)) continue;
    lastIdxByEdge.set(row.edge, i);
  }
  const out: BoxTraySideRow[] = [];
  for (let i = 0; i < raw.length; i++) {
    const row = raw[i];
    if (!isBoxTrayEdge(row.edge)) continue;
    if (lastIdxByEdge.get(row.edge) !== i) continue;
    const h = round2(Math.min(MAX_FLANGE_IN, Math.max(0.01, Number(row.flangeHeightIn) || 0.01)));
    const a = clampAngleDeg(Number(row.angleDeg) || 0);
    out.push({ ...row, flangeHeightIn: h, angleDeg: a });
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
