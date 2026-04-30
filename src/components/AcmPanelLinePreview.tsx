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

function buildProfilePolyline(panelWidthIn: number, sides: BoxTraySideRow[]): {
  points: Pt[];
  labels: { text: string; at: Pt; angleRad: number }[];
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
  }

  return { points: pts, labels };
}

export function AcmPanelLinePreview({
  panelWidthIn,
  panelLengthIn,
  boxSides = [],
  panelColorName,
  title = "Fold & bend preview",
  subtitle = "Drag to rotate; use +, −, and 1× to zoom. Labels show the flat center and each fold.",
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
  const [rot, setRot] = useState(() => -Math.PI / 2);
  const drag = useRef<{ x: number; y: number; rot: number; active: boolean } | null>(null);

  const { points, labels } = useMemo(
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

    // Small nodes.
    ctx.fillStyle = strokeColor;
    for (const p of points) {
      const q = tx(p);
      ctx.beginPath();
      ctx.arc(q.x, q.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Labels.
    ctx.font = "600 12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
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
  }, [outCanvasRef, viewportH, viewportW, points, labels, zoomMul, rot, panelWidthIn, panelLengthIn, panelColorName]);

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
          className="block h-full w-full cursor-grab active:cursor-grabbing"
          onPointerDown={(e) => {
            (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
            drag.current = { x: e.clientX, y: e.clientY, rot, active: true };
          }}
          onPointerMove={(e) => {
            if (!drag.current?.active) return;
            const dx = e.clientX - drag.current.x;
            setRot(drag.current.rot + dx * 0.01);
          }}
          onPointerUp={(e) => {
            (e.currentTarget as HTMLCanvasElement).releasePointerCapture(e.pointerId);
            drag.current = null;
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
          aria-label="Line preview"
        />
      </div>
    </section>
  );
}

