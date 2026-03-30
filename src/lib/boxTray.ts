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

/** One flap per edge; later rows for the same edge replace earlier (last wins). */
export function normalizeBoxTraySides(raw: BoxTraySideRow[]): BoxTraySideRow[] {
  const byEdge = new Map<BoxTrayEdge, BoxTraySideRow>();
  for (const row of raw) {
    if (!isBoxTrayEdge(row.edge)) continue;
    const h = round2(Math.min(MAX_FLANGE_IN, Math.max(0.01, Number(row.flangeHeightIn) || 0.01)));
    const a = clampAngleDeg(Number(row.angleDeg) || 0);
    byEdge.set(row.edge, {
      ...row,
      flangeHeightIn: h,
      angleDeg: a,
    });
  }
  const order: BoxTrayEdge[] = ["south", "east", "north", "west"];
  return order.map((e) => byEdge.get(e)).filter((x): x is BoxTraySideRow => x != null);
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
