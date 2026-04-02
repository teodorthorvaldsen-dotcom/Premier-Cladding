import type { BoxTrayEdge, BoxTraySideRow } from "@/types/boxTray";
import { normalizeBoxTraySides } from "@/lib/boxTray";

/** Axis-aligned rectangle in inches (same XY convention as 3D preview: base y ∈ [0, L], x centered on 0). */
export type InchesRect = { minX: number; maxX: number; minY: number; maxY: number };

type Vec2 = { x: number; y: number };

type BuiltFlat = {
  key: string;
  edge?: BoxTrayEdge;
  pos: Vec2;
  args: [number, number, number];
};

function returnDepthFromArgs(edge: BoxTrayEdge, args: [number, number, number]): number {
  return edge === "south" || edge === "north" ? args[1] : args[0];
}

function outerTipLocal(edge: BoxTrayEdge, args: [number, number, number]): Vec2 {
  const H = returnDepthFromArgs(edge, args);
  switch (edge) {
    case "south":
      return { x: 0, y: -H / 2 };
    case "north":
      return { x: 0, y: H / 2 };
    case "west":
      return { x: -H / 2, y: 0 };
    case "east":
      return { x: H / 2, y: 0 };
    default:
      return { x: 0, y: 0 };
  }
}

function hingeLocalForEdge(edge: BoxTrayEdge, H: number): Vec2 {
  switch (edge) {
    case "south":
      return { x: 0, y: H / 2 };
    case "north":
      return { x: 0, y: -H / 2 };
    case "west":
      return { x: H / 2, y: 0 };
    case "east":
      return { x: -H / 2, y: 0 };
    default:
      return { x: 0, y: 0 };
  }
}

function partFromHinge(
  key: string,
  hingeWorld: Vec2,
  hingeLocal: Vec2,
  args: [number, number, number],
  edge: BoxTrayEdge
): BuiltFlat {
  return {
    key,
    edge,
    pos: { x: hingeWorld.x - hingeLocal.x, y: hingeWorld.y - hingeLocal.y },
    args,
  };
}

function rectFromBuilt(p: BuiltFlat): InchesRect {
  const [aw, ah] = p.args;
  return {
    minX: p.pos.x - aw / 2,
    maxX: p.pos.x + aw / 2,
    minY: p.pos.y - ah / 2,
    maxY: p.pos.y + ah / 2,
  };
}

/**
 * Unfolded blank as axis-aligned rectangles (inches), matching {@link buildBoxTrayParts} in
 * `AcmPanel3DPreview.tsx` with bends at 0° — suitable for a 2D cut outline / DXF.
 */
export function buildTrayFlatRects(widthIn: number, lengthIn: number, sides: BoxTraySideRow[]): InchesRect[] {
  const W = widthIn;
  const L = lengthIn;
  const n = normalizeBoxTraySides(sides);
  const rects: InchesRect[] = [{ minX: -W / 2, maxX: W / 2, minY: 0, maxY: L }];

  if (n.length === 0) return rects;

  const parts: BuiltFlat[] = [
    { key: "base", pos: { x: 0, y: L / 2 }, args: [W, L, 0] },
  ];

  let stackSouth = 0;
  let stackNorth = 0;
  let stackWest = 0;
  let stackEast = 0;

  for (let i = 0; i < n.length; i++) {
    const side = n[i]!;
    const H = Math.max(side.flangeHeightIn, 0.01);
    let p: BuiltFlat;

    const prevSide = i > 0 ? n[i - 1] : undefined;
    const prevBuilt = parts[parts.length - 1]!;
    const explicitChildOfPrev =
      typeof side.parentId === "string" &&
      side.parentId.length > 0 &&
      prevSide !== undefined &&
      side.parentId === prevSide.id;
    const legacySameEdgeNoParent =
      !side.parentId && !!prevSide && !prevSide.parentId && side.edge === prevSide.edge;
    const isCompoundGeom =
      i > 0 &&
      !!prevSide &&
      prevBuilt.key !== "base" &&
      prevBuilt.edge === side.edge &&
      side.edge === prevSide.edge &&
      (explicitChildOfPrev || legacySameEdgeNoParent);

    if (isCompoundGeom && prevBuilt.edge) {
      const posP = prevBuilt.pos;
      const tipLocal = outerTipLocal(side.edge, prevBuilt.args);
      const hingeWorld = { x: posP.x + tipLocal.x, y: posP.y + tipLocal.y };
      const hingeLocalChild = hingeLocalForEdge(side.edge, H);
      const argsCh: [number, number, number] =
        side.edge === "south" || side.edge === "north" ? [W, H, 0] : [H, L, 0];
      p = partFromHinge(side.id, hingeWorld, hingeLocalChild, argsCh, side.edge);
      parts.push(p);
      rects.push(rectFromBuilt(p));
      continue;
    }

    switch (side.edge) {
      case "south": {
        const hingeY = -stackSouth;
        p = partFromHinge(
          side.id,
          { x: 0, y: hingeY },
          hingeLocalForEdge("south", H),
          [W, H, 0],
          "south"
        );
        stackSouth += H;
        break;
      }
      case "north": {
        const hingeY = L + stackNorth;
        p = partFromHinge(
          side.id,
          { x: 0, y: hingeY },
          hingeLocalForEdge("north", H),
          [W, H, 0],
          "north"
        );
        stackNorth += H;
        break;
      }
      case "west": {
        const hingeX = -W / 2 - stackWest;
        p = partFromHinge(
          side.id,
          { x: hingeX, y: L / 2 },
          hingeLocalForEdge("west", H),
          [H, L, 0],
          "west"
        );
        stackWest += H;
        break;
      }
      case "east": {
        const hingeX = W / 2 + stackEast;
        p = partFromHinge(
          side.id,
          { x: hingeX, y: L / 2 },
          hingeLocalForEdge("east", H),
          [H, L, 0],
          "east"
        );
        stackEast += H;
        break;
      }
      default:
        continue;
    }
    parts.push(p);
    rects.push(rectFromBuilt(p));
  }

  return rects;
}

function round6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

function pk(x: number, y: number): string {
  return `${round6(x)},${round6(y)}`;
}

/**
 * Outer orthogonal boundary of the union of rectangles (for DXF / CAM outline).
 * Builds a grid from rectangle corners, marks covered cells, extracts boundary unit edges,
 * merges collinear runs, then walks the unique closed orthogonal loop.
 */
export function outerOutlineFromRects(rects: InchesRect[]): Vec2[] {
  if (rects.length === 0) return [];
  const xs = new Set<number>();
  const ys = new Set<number>();
  for (const r of rects) {
    xs.add(round6(r.minX));
    xs.add(round6(r.maxX));
    ys.add(round6(r.minY));
    ys.add(round6(r.maxY));
  }
  const xArr = [...xs].sort((a, b) => a - b);
  const yArr = [...ys].sort((a, b) => a - b);
  const nx = xArr.length - 1;
  const ny = yArr.length - 1;
  if (nx <= 0 || ny <= 0) {
    const r = rects[0]!;
    return [
      { x: r.minX, y: r.minY },
      { x: r.maxX, y: r.minY },
      { x: r.maxX, y: r.maxY },
      { x: r.minX, y: r.maxY },
    ];
  }

  const covered: boolean[][] = Array.from({ length: nx }, () => Array<boolean>(ny).fill(false));
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < ny; j++) {
      const cx = (xArr[i]! + xArr[i + 1]!) / 2;
      const cy = (yArr[j]! + yArr[j + 1]!) / 2;
      covered[i]![j] = rects.some(
        (r) => cx >= r.minX && cx <= r.maxX && cy >= r.minY && cy <= r.maxY
      );
    }
  }

  type UndirEdge = { a: string; b: string; ax: number; ay: number; bx: number; by: number };
  const edgeMap = new Map<string, UndirEdge>();

  const addEdge = (ax: number, ay: number, bx: number, by: number) => {
    const ka = pk(ax, ay);
    const kb = pk(bx, by);
    const k = ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
    if (!edgeMap.has(k)) edgeMap.set(k, { a: ka, b: kb, ax, ay, bx, by });
  };

  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < ny; j++) {
      if (!covered[i]![j]) continue;
      const x0 = xArr[i]!;
      const x1 = xArr[i + 1]!;
      const y0 = yArr[j]!;
      const y1 = yArr[j + 1]!;
      if (j === 0 || !covered[i]![j - 1]) addEdge(x0, y0, x1, y0);
      if (j === ny - 1 || !covered[i]![j + 1]) addEdge(x0, y1, x1, y1);
      if (i === 0 || !covered[i - 1]![j]) addEdge(x0, y0, x0, y1);
      if (i === nx - 1 || !covered[i + 1]![j]) addEdge(x1, y0, x1, y1);
    }
  }

  const adj = new Map<string, Vec2[]>();
  for (const e of edgeMap.values()) {
    const pa = { x: e.ax, y: e.ay };
    const pb = { x: e.bx, y: e.by };
    const la = adj.get(e.a) ?? [];
    la.push(pb);
    adj.set(e.a, la);
    const lb = adj.get(e.b) ?? [];
    lb.push(pa);
    adj.set(e.b, lb);
  }

  let startK = "";
  let startPt: Vec2 | null = null;
  for (const k of adj.keys()) {
    const parts = k.split(",");
    const sx = Number(parts[0]);
    const sy = Number(parts[1]);
    if (!startPt || sy < startPt.y - 1e-9 || (Math.abs(sy - startPt.y) < 1e-9 && sx < startPt.x)) {
      startPt = { x: sx, y: sy };
      startK = k;
    }
  }
  if (!startPt || !adj.has(startK)) return [];

  const poly: Vec2[] = [{ x: startPt.x, y: startPt.y }];
  let curK = startK;
  let cur: Vec2 = { ...startPt };
  let prev: Vec2 = { x: cur.x - 1, y: cur.y };

  const pickNext = (at: Vec2, from: Vec2, neighbors: Vec2[]): Vec2 | null => {
    const others = neighbors.filter((p) => Math.abs(p.x - from.x) > 1e-9 || Math.abs(p.y - from.y) > 1e-9);
    if (others.length === 1) return others[0]!;
    if (others.length === 0) return null;
    /** First step from bottom-leftmost vertex: walk east along the bottom exterior. */
    const east = others.find((p) => Math.abs(p.y - at.y) < 1e-9 && p.x > at.x + 1e-9);
    if (east) return east;
    const north = others.find((p) => Math.abs(p.x - at.x) < 1e-9 && p.y > at.y + 1e-9);
    if (north) return north;
    return others[0]!;
  };

  for (let guard = 0; guard < 5000; guard++) {
    const nbs = adj.get(curK);
    if (!nbs?.length) break;
    const next = pickNext(cur, prev, nbs);
    if (!next) break;
    const nk = pk(next.x, next.y);
    if (guard > 0 && nk === startK && poly.length > 2) break;
    if (Math.abs(next.x - poly[poly.length - 1]!.x) > 1e-9 || Math.abs(next.y - poly[poly.length - 1]!.y) > 1e-9) {
      poly.push({ x: round6(next.x), y: round6(next.y) });
    }
    prev = cur;
    cur = next;
    curK = nk;
  }

  if (poly.length >= 3) {
    const last = poly[poly.length - 1]!;
    const first = poly[0]!;
    if (Math.abs(last.x - first.x) < 1e-9 && Math.abs(last.y - first.y) < 1e-9) poly.pop();
  }

  return poly.length >= 3 ? poly : [];
}

export function buildTrayFlatOutline(
  widthIn: number,
  lengthIn: number,
  sides: BoxTraySideRow[]
): Vec2[] {
  const rects = buildTrayFlatRects(widthIn, lengthIn, sides);
  return outerOutlineFromRects(rects);
}
