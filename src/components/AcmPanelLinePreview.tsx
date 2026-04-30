"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import type { BoxTraySideRow } from "@/types/boxTray";
import { normalizeBoxTraySidesForFlashing } from "@/lib/boxTray";

const PREVIEW_H = 360;
const PREVIEW_H_COMPACT = 240;
const PREVIEW_W = 520;

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

type Pt = { x: number; y: number };

function midpoint(a: Pt, b: Pt): Pt {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export interface AcmPanelLinePreviewProps {
  /** Flat center width (in). */
  panelWidthIn: number;
  /** Flat center length (in). Not shown in the profile; used in caption only. */
  panelLengthIn: number;
  /** Flashing/tray side rows; flashing uses a single-edge fold chain. */
  boxSides?: BoxTraySideRow[];
  panelColorName: string;
  title?: string;
  subtitle?: string;
  compact?: boolean;
  scale?: number;
  /** For add-to-cart screenshot capture (canvas `toDataURL`). */
  canvasRef?: MutableRefObject<HTMLCanvasElement | null>;
}

function fmtIn(n: number): string {
  if (!Number.isFinite(n)) return "";
  const r = Math.round(n * 100) / 100;
  if (Math.abs(r - Math.round(r)) < 1e-9) return `${Math.round(r)}"`;
  if (Math.abs(r * 2 - Math.round(r * 2)) < 1e-9) return `${(Math.round(r * 2) / 2).toFixed(1).replace(/\.0$/, "")}"`;
  return `${r.toFixed(2).replace(/0$/, "").replace(/\.$/, "")}"`;
}

function buildProfilePolyline(
  panelWidthIn: number,
  sides: BoxTraySideRow[]
): {
  points: Pt[];
  labels: { text: string; at: Pt; angleRad: number }[];
  segmentLensIn: number[];
  vertexAnglesDeg: number[];
  hemRender?: { type: "open" | "closed"; startIndex: number; endIndex: number };
} {
  const width = Math.max(0.01, Number(panelWidthIn) || 0.01);
  const n = normalizeBoxTraySidesForFlashing(sides);
  const rootEdge = n[0]?.edge ?? "east";
  const anchorRight = rootEdge === "east" || rootEdge === "north";

  // Base segment centered on origin.
  const left: Pt = { x: -width / 2, y: 0 };
  const right: Pt = { x: width / 2, y: 0 };
  const baseStart = anchorRight ? left : right;
  const baseEnd = anchorRight ? right : left;

  const pts: Pt[] = [baseStart, baseEnd];
  const labels: { text: string; at: Pt; angleRad: number }[] = [
    { text: "Flat center", at: midpoint(baseStart, baseEnd), angleRad: 0 },
  ];
  const segmentLensIn: number[] = [width];
  const vertexAnglesDeg: number[] = [];

  let dir = anchorRight ? 0 : Math.PI; // along the base, away from center
  for (let i = 0; i < n.length; i++) {
    const row = n[i]!;
    const H = Math.max(0.01, Number(row.flangeHeightIn) || 0.01);
    const a = clamp(Number(row.angleDeg) || 0, -180, 180);
    dir += (anchorRight ? 1 : -1) * degToRad(a);
    const p0 = pts[pts.length - 1]!;
    const p1 = { x: p0.x + Math.cos(dir) * H, y: p0.y + Math.sin(dir) * H };
    pts.push(p1);
    labels.push({ text: `F${i + 1}`, at: midpoint(p0, p1), angleRad: dir });
    segmentLensIn.push(H);
    vertexAnglesDeg.push(a);
  }

  // Hem is stored per-fold; only leaf folds have a free edge. Flashing is linear, so the last row is the leaf.
  let hemRender: { type: "open" | "closed"; startIndex: number; endIndex: number } | undefined;
  if (n.length > 0) {
    const last = n[n.length - 1]!;
    const hemType = last.hemType;
    const hemSize =
      typeof last.hemSizeIn === "number" && Number.isFinite(last.hemSizeIn) ? last.hemSizeIn : 0.5;
    if (hemType === "open" || hemType === "closed") {
      const a = 180;
      dir += (anchorRight ? 1 : -1) * degToRad(a);
      const p0 = pts[pts.length - 1]!;
      const p1 = { x: p0.x + Math.cos(dir) * hemSize, y: p0.y + Math.sin(dir) * hemSize };
      pts.push(p1);
      labels.push({
        text: hemType === "closed" ? "Hem (closed)" : "Hem (open)",
        at: midpoint(p0, p1),
        angleRad: dir,
      });
      segmentLensIn.push(hemSize);
      vertexAnglesDeg.push(a);
      hemRender = { type: hemType, startIndex: pts.length - 2, endIndex: pts.length - 1 };
    }
  }

  return { points: pts, labels, segmentLensIn, vertexAnglesDeg, ...(hemRender ? { hemRender } : {}) };
}

export function AcmPanelLinePreview({
  panelWidthIn,
  panelLengthIn,
  boxSides = [],
  panelColorName,
  title = "Fold & bend preview",
  subtitle = "Scaled detail view (no rotation). Use +, −, and 1× to zoom. Dimensions and angles reflect your inputs.",
  compact = false,
  scale = 1,
  canvasRef,
}: AcmPanelLinePreviewProps) {
  const safeScale = Number.isFinite(scale) ? clamp(scale, 0.5, 3) : 1;
  const viewportH = (compact ? PREVIEW_H_COMPACT : PREVIEW_H) * safeScale;
  const viewportW = PREVIEW_W * safeScale;

  const localCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outCanvasRef = canvasRef ?? localCanvasRef;

  const [zoomMul, setZoomMul] = useState(1);
  /** Fixed orthographic orientation (shop-detail style). */
  const rot = 0;

  const { points, labels, segmentLensIn, vertexAnglesDeg, hemRender } = useMemo(
    () => buildProfilePolyline(panelWidthIn, boxSides),
    [panelWidthIn, boxSides]
  );

  useEffect(() => {
    const canvas = outCanvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const rectW = parent?.clientWidth && parent.clientWidth > 0 ? parent.clientWidth : viewportW;
    const rectH = parent?.clientHeight && parent.clientHeight > 0 ? parent.clientHeight : viewportH;
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.floor(rectW * dpr);
    canvas.height = Math.floor(rectH * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const pad = 42;

    ctx.clearRect(0, 0, rectW, rectH);

    // Background.
    ctx.fillStyle = "#f4f5f7";
    ctx.fillRect(0, 0, rectW, rectH);

    const cx = rectW / 2;
    const cy = rectH / 2;

    // Fit based on rotated bounds so long shallow profiles stay centered and visible.
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const p of points) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    const cosR = Math.cos(rot);
    const sinR = Math.sin(rot);
    const rotPts = points.map((p) => {
      const x0 = p.x - midX;
      const y0 = p.y - midY;
      return { x: x0 * cosR - y0 * sinR, y: x0 * sinR + y0 * cosR };
    });

    let rMinX = Infinity,
      rMinY = Infinity,
      rMaxX = -Infinity,
      rMaxY = -Infinity;
    for (const p of rotPts) {
      rMinX = Math.min(rMinX, p.x);
      rMinY = Math.min(rMinY, p.y);
      rMaxX = Math.max(rMaxX, p.x);
      rMaxY = Math.max(rMaxY, p.y);
    }
    const rSpanX = Math.max(0.01, rMaxX - rMinX);
    const rSpanY = Math.max(0.01, rMaxY - rMinY);

    const scaleFit = Math.min((rectW - pad * 2) / rSpanX, (rectH - pad * 2) / rSpanY);
    const k = scaleFit * clamp(zoomMul, 0.42, 3.1);

    const tx = (p: Pt): Pt => {
      const x0 = p.x - midX;
      const y0 = p.y - midY;
      const xr = x0 * cosR - y0 * sinR;
      const yr = x0 * sinR + y0 * cosR;
      const x1 = (xr - (rMinX + rMaxX) / 2) * k;
      const y1 = (yr - (rMinY + rMaxY) / 2) * k;
      return { x: cx + x1, y: cy - y1 };
    };

    const screenPts = points.map(tx);

    const drawArrow = (x: number, y: number, dx: number, dy: number, size = 7) => {
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const px = -uy;
      const py = ux;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - ux * size + px * (size * 0.5), y - uy * size + py * (size * 0.5));
      ctx.lineTo(x - ux * size - px * (size * 0.5), y - uy * size - py * (size * 0.5));
      ctx.closePath();
      ctx.fill();
    };

    const drawDim = (a: Pt, b: Pt, label: string) => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const segLen = Math.hypot(dx, dy);
      if (segLen < 8) return;
      const ux = dx / segLen;
      const uy = dy / segLen;
      const px = -uy;
      const py = ux;
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const toCenter = { x: mid.x - cx, y: mid.y - cy };
      const sign = toCenter.x * px + toCenter.y * py > 0 ? 1 : -1;
      const off = 22 * sign;
      const ax = a.x + px * off;
      const ay = a.y + py * off;
      const bx = b.x + px * off;
      const by = b.y + py * off;

      ctx.strokeStyle = "rgba(17,24,39,0.65)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(ax, ay);
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(bx, by);
      ctx.stroke();

      ctx.strokeStyle = "rgba(17,24,39,0.9)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();

      ctx.fillStyle = "rgba(17,24,39,0.9)";
      drawArrow(ax, ay, ux, uy);
      drawArrow(bx, by, -ux, -uy);

      ctx.save();
      ctx.translate((ax + bx) / 2, (ay + by) / 2);
      const ang = Math.atan2(by - ay, bx - ax);
      const flip = Math.cos(ang) < 0;
      ctx.rotate(flip ? ang + Math.PI : ang);
      ctx.font = "700 12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
      const m = ctx.measureText(label);
      const w = m.width + 10;
      ctx.fillStyle = "rgba(244,245,247,0.92)";
      ctx.fillRect(-w / 2, -10, w, 20);
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 1;
      ctx.strokeRect(-w / 2, -10, w, 20);
      ctx.fillStyle = "#111827";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, 0, 0);
      ctx.restore();
    };

    const drawAngle = (p: Pt, deg: number) => {
      const t = `${Math.round(deg)}°`;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.font = "700 12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
      const m = ctx.measureText(t);
      const w = m.width + 10;
      ctx.fillStyle = "rgba(244,245,247,0.92)";
      ctx.fillRect(-w / 2, -10, w, 20);
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 1;
      ctx.strokeRect(-w / 2, -10, w, 20);
      ctx.fillStyle = "#111827";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(t, 0, 0);
      ctx.restore();
    };

    const strokeColor = "#0b1220";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 4;

    ctx.beginPath();
    const p0 = tx(points[0]!);
    ctx.moveTo(p0.x, p0.y);
    for (let i = 1; i < points.length; i++) {
      const p = tx(points[i]!);
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    // COLOR leader (like typical detail callout).
    if (screenPts.length >= 2) {
      const a = screenPts[0]!;
      const b = screenPts[1]!;
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const labelX = mid.x + 70;
      const labelY = mid.y - 55;
      ctx.strokeStyle = "rgba(17,24,39,0.75)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(mid.x, mid.y);
      ctx.lineTo(labelX - 8, labelY + 8);
      ctx.stroke();
      ctx.fillStyle = "rgba(244,245,247,0.92)";
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 1;
      ctx.font = "800 12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
      const t = "COLOR";
      const m = ctx.measureText(t);
      const w = m.width + 12;
      ctx.fillRect(labelX - w / 2, labelY - 11, w, 22);
      ctx.strokeRect(labelX - w / 2, labelY - 11, w, 22);
      ctx.fillStyle = "#111827";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(t, labelX, labelY);
    }

    // Hem rendering: draw like open / flattened hem rather than a single segment.
    if (hemRender) {
      const s = screenPts[hemRender.startIndex];
      const e = screenPts[hemRender.endIndex];
      if (s && e) {
        const dx = e.x - s.x;
        const dy = e.y - s.y;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len;
        const uy = dy / len;
        const nx = -uy;
        const ny = ux;
        const bg = "#f4f5f7";
        const gap = hemRender.type === "open" ? 8 : 3;

        // Erase the simple hem segment we drew as part of the polyline.
        ctx.strokeStyle = bg;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(e.x, e.y);
        ctx.stroke();

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (hemRender.type === "open") {
          // Open hem: show a loop with a visible gap.
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x + nx * gap, s.y + ny * gap);
          ctx.lineTo(e.x + nx * gap, e.y + ny * gap);
          ctx.lineTo(e.x, e.y);
          ctx.stroke();
        } else {
          // Flattened hem: show two layers pressed together (double line).
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(e.x, e.y);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(s.x + nx * gap, s.y + ny * gap);
          ctx.lineTo(e.x + nx * gap, e.y + ny * gap);
          ctx.stroke();

          // Small closure at the tip.
          ctx.beginPath();
          ctx.moveTo(e.x, e.y);
          ctx.lineTo(e.x + nx * gap, e.y + ny * gap);
          ctx.stroke();
        }
      }
    }

    // Dimensions (NorthClad-style callouts).
    for (let i = 0; i < screenPts.length - 1; i++) {
      const a = screenPts[i]!;
      const b = screenPts[i + 1]!;
      const len = segmentLensIn[i] ?? 0;
      if (len > 0) {
        // Base/face dimension is typically labeled "A" in shop details.
        if (i === 0) drawDim(a, b, `A  ${fmtIn(len)}`);
        else drawDim(a, b, fmtIn(len));
      }
    }
    for (let i = 1; i < screenPts.length - 1; i++) {
      const deg = vertexAnglesDeg[i - 1];
      if (typeof deg === "number" && Number.isFinite(deg)) {
        const p = screenPts[i]!;
        // Nudge angle tag slightly away from the vertex along the local normal.
        const a = screenPts[i - 1]!;
        const b = screenPts[i + 1]!;
        const vx = b.x - a.x;
        const vy = b.y - a.y;
        const vlen = Math.hypot(vx, vy) || 1;
        const nx = -vy / vlen;
        const ny = vx / vlen;
        drawAngle({ x: p.x + nx * 18, y: p.y + ny * 18 }, deg);
      }
    }

    // Small nodes.
    ctx.fillStyle = strokeColor;
    for (const p of points) {
      const q = tx(p);
      ctx.beginPath();
      ctx.arc(q.x, q.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Labels.
    ctx.font = "700 11px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const l of labels) {
      const q = tx(l.at);
      ctx.save();
      ctx.translate(q.x, q.y);
      // Keep text mostly upright regardless of profile rotation.
      const a = rot + l.angleRad;
      const flip = Math.cos(a) < 0;
      ctx.rotate(flip ? a + Math.PI : a);
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      const m = ctx.measureText(l.text);
      const w = m.width + 10;
      ctx.fillRect(-w / 2, -9, w, 18);
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 1;
      ctx.strokeRect(-w / 2, -9, w, 18);
      ctx.fillStyle = "#111827";
      ctx.fillText(l.text, 0, 0);
      ctx.restore();
    }

    // Caption (bottom).
    ctx.font = "500 12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillStyle = "rgba(17,24,39,0.82)";
    ctx.textAlign = "center";
    ctx.fillText(`${panelWidthIn}" × ${panelLengthIn}" · ${panelColorName}`, rectW / 2, rectH - 18);
  }, [outCanvasRef, viewportH, viewportW, points, labels, zoomMul, panelWidthIn, panelLengthIn, panelColorName, segmentLensIn, vertexAnglesDeg, hemRender]);

  return (
    <section
      className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:p-4"
      aria-labelledby="acm-panel-line-preview-heading"
    >
      <h2
        id="acm-panel-line-preview-heading"
        className="text-[15px] font-medium uppercase tracking-wider text-gray-500"
      >
        {title}
      </h2>
      <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>

      <div
        className="relative mx-auto mt-3 overflow-hidden rounded-xl border border-gray-100 bg-[#f4f5f7]"
        style={{ height: viewportH, maxWidth: viewportW }}
      >
        <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 rounded-lg border border-gray-200/90 bg-white/95 p-0.5 shadow-sm backdrop-blur-sm">
          <button
            type="button"
            className="flex h-9 min-w-[2.25rem] items-center justify-center rounded-md text-base font-semibold text-gray-800 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
            aria-label="Zoom preview out"
            onClick={() => setZoomMul((z) => clamp(z / 1.14, 0.42, 3.1))}
          >
            −
          </button>
          <button
            type="button"
            className="flex h-9 min-w-[2.25rem] items-center justify-center rounded-md text-base font-semibold text-gray-800 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
            aria-label="Reset preview zoom"
            onClick={() => setZoomMul(1)}
          >
            1×
          </button>
          <button
            type="button"
            className="flex h-9 min-w-[2.25rem] items-center justify-center rounded-md text-base font-semibold text-gray-800 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
            aria-label="Zoom preview in"
            onClick={() => setZoomMul((z) => clamp(z * 1.14, 0.42, 3.1))}
          >
            +
          </button>
        </div>

        <canvas
          ref={(el) => {
            outCanvasRef.current = el;
          }}
          className="block h-full w-full cursor-default"
          aria-label="Line preview"
        />
      </div>
    </section>
  );
}

