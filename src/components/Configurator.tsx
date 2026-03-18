"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  allWidths,
  colors,
  finishes,
  thicknesses,
  type ColorId,
  type ThicknessId,
} from "@/data/acm";
import { type QuoteDraft, QUOTE_DRAFT_STORAGE_KEY } from "@/types/quote";
import Link from "next/link";
import type { PanelType } from "@/lib/pricing";
import { useCart } from "@/context/CartContext";
import { ColorSwatches } from "./ColorSwatches";
import { MaterialCompositionDiagram } from "./MaterialCompositionDiagram";
import { PanelTypePicker } from "./PanelTypePicker";
import { PriceSummary } from "./PriceSummary";
import { QuantityPicker } from "./QuantityPicker";
import { SizePicker, type SizeSelection } from "./SizePicker";
import { ThicknessPicker } from "./ThicknessPicker";

const defaultSize: SizeSelection = {
  widthId: "custom",
  widthIn: 62,
  lengthIn: 96,
};

const MIN_WIDTH_IN = 12;
const MAX_WIDTH_IN = 62;
const MIN_LENGTH_IN = 12;
const MAX_LENGTH_IN = 190;

type PanelStateMap = Record<string, string>;

interface ProjectExampleProps {
  activeHex: string;
}

type PanelDef = {
  id: string;
  pts: string;
};

type FacadePanel = {
  id: string;
  points: string;
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpPoint(ax: number, ay: number, bx: number, by: number, t: number) {
  return { x: lerp(ax, bx, t), y: lerp(ay, by, t) };
}

function PanelPreviewFromImage() {
  const materials = {
    arcticWhite: {
      face: "#e9eef7",
      side: "#4b5563",
      top: "#374151",
      label: "Arctic White",
    },
    micaGrey: {
      face: "#bcc6d8",
      side: "#4b5563",
      top: "#374151",
      label: "Mica Grey",
    },
    marineAluminum: {
      face: "#d4d8df",
      side: "#596270",
      top: "#414a57",
      label: "Marine Aluminum",
    },
    charcoal: {
      face: "#6b7280",
      side: "#374151",
      top: "#1f2937",
      label: "Charcoal",
    },
    black: {
      face: "#1f2937",
      side: "#111827",
      top: "#0b1220",
      label: "Black",
    },
    fordBlue: {
      face: "#2563eb",
      side: "#1d4ed8",
      top: "#1e40af",
      label: "Ford Blue",
    },
  } as const;

  type MaterialKey = keyof typeof materials;

  const [activeMaterial, setActiveMaterial] = useState<MaterialKey>("micaGrey");
  const [panelWidth, setPanelWidth] = useState(48);
  const [panelLength, setPanelLength] = useState(120);
  const [panelDepth, setPanelDepth] = useState(2);
  const [showReference, setShowReference] = useState(true);
  const [showOverlayGuides, setShowOverlayGuides] = useState(false);

  const active = materials[activeMaterial];

  const config = useMemo(() => {
    const viewW = 800;
    const viewH = 595;

    // base traced panel geometry from PNG (800x595)
    const baseA = { x: 244, y: 32 };
    const baseB = { x: 485, y: 187 };
    const baseC = { x: 485, y: 593 };
    const baseD = { x: 244, y: 454 };

    const baseE = { x: 497, y: 180 };
    const baseF = { x: 497, y: 595 };

    const baseG = { x: 255, y: -2 };
    const baseH = { x: 498, y: 154 };

    const baseWidth = baseB.x - baseA.x;
    const baseLength = baseD.y - baseA.y;

    const widthScale = panelWidth / 48;
    const lengthScale = panelLength / 120;
    const depthScale = panelDepth / 2;

    const scalePoint = (p: { x: number; y: number }, anchor = baseA) => ({
      x: anchor.x + (p.x - anchor.x) * widthScale,
      y: anchor.y + (p.y - anchor.y) * lengthScale,
    });

    const A = { ...baseA };
    const B = scalePoint(baseB);
    const C = {
      x: A.x + (baseC.x - baseA.x) * widthScale,
      y: A.y + (baseC.y - baseA.y) * lengthScale,
    };
    const D = {
      x: A.x + (baseD.x - baseA.x) * widthScale,
      y: A.y + (baseD.y - baseA.y) * lengthScale,
    };

    const sideInsetX = (baseE.x - baseB.x) * depthScale;
    const sideInsetYTop = (baseE.y - baseB.y) * depthScale;
    const sideInsetYBottom = (baseF.y - baseC.y) * depthScale;

    const E = {
      x: B.x + sideInsetX,
      y: B.y + sideInsetYTop,
    };

    const F = {
      x: C.x + sideInsetX,
      y: C.y + sideInsetYBottom,
    };

    const G = {
      x: A.x + (baseG.x - baseA.x) * depthScale,
      y: A.y + (baseG.y - baseA.y) * depthScale,
    };

    const H = {
      x: B.x + (baseH.x - baseB.x) * depthScale,
      y: B.y + (baseH.y - baseB.y) * depthScale,
    };

    const interpolate = (
      p1: { x: number; y: number },
      p2: { x: number; y: number },
      t: number
    ) => ({
      x: p1.x + (p2.x - p1.x) * t,
      y: p1.y + (p2.y - p1.y) * t,
    });

    const finCount = Math.max(3, Math.round(panelWidth / 12));
    const finStartRatio = 0.08;
    const finEndRatio = 0.92;
    const finSpan = finEndRatio - finStartRatio;
    const finWidthRatio = Math.min(0.1, finSpan / (finCount * 1.7));

    const fins = Array.from({ length: finCount }).map((_, i) => {
      const step = finSpan / finCount;
      const t1 = finStartRatio + i * step;
      const t2 = Math.min(t1 + finWidthRatio, finEndRatio);

      const front1 = interpolate(A, B, t1);
      const front2 = interpolate(A, B, t2);

      const liftX = (G.x - A.x) * 0.82;
      const liftY = (G.y - A.y) * 0.82;

      const back1 = { x: front1.x + liftX, y: front1.y + liftY };
      const back2 = { x: front2.x + liftX, y: front2.y + liftY };

      return { front1, front2, back1, back2 };
    });

    return {
      viewW,
      viewH,
      A,
      B,
      C,
      D,
      E,
      F,
      G,
      H,
      fins,
      frontWidthPx: baseWidth * widthScale,
      frontLengthPx: baseLength * lengthScale,
    };
  }, [panelWidth, panelLength, panelDepth]);

  const { A, B, C, D, E, F, G, H, fins, viewW, viewH } = config;

  const frontPoints = `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y} ${D.x},${D.y}`;
  const sidePoints = `${B.x},${B.y} ${E.x},${E.y} ${F.x},${F.y} ${C.x},${C.y}`;
  const topPoints = `${A.x},${A.y} ${B.x},${B.y} ${H.x},${H.y} ${G.x},${G.y}`;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <p className="text-[13px] text-gray-600">
            Uses the shop-drawing style PNG as a reference and overlays a recolorable 3D panel.
          </p>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(materials) as [MaterialKey, (typeof materials)[MaterialKey]][]).map(
              ([key, material]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveMaterial(key)}
                  className={`flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-xs font-medium ${
                    activeMaterial === key
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <span
                    className="h-4 w-4 rounded-full border border-gray-300"
                    style={{ background: material.face }}
                  />
                  <span className="text-gray-900">{material.label}</span>
                </button>
              )
            )}
          </div>
          <div className="space-y-3 text-[12px]">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="font-medium text-gray-900">Width (X axis)</span>
                <span className="text-gray-600">{panelWidth} in</span>
              </div>
              <input
                type="range"
                min={12}
                max={96}
                step={1}
                value={panelWidth}
                onChange={(e) => setPanelWidth(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="font-medium text-gray-900">Length (Y axis)</span>
                <span className="text-gray-600">{panelLength} in</span>
              </div>
              <input
                type="range"
                min={24}
                max={192}
                step={1}
                value={panelLength}
                onChange={(e) => setPanelLength(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="font-medium text-gray-900">Depth</span>
                <span className="text-gray-600">{panelDepth} in</span>
              </div>
              <input
                type="range"
                min={1}
                max={4}
                step={0.5}
                value={panelDepth}
                onChange={(e) => setPanelDepth(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowReference((v) => !v)}
              className="rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-[12px] font-medium text-gray-900 hover:bg-gray-50"
            >
              {showReference ? "Hide PNG reference" : "Show PNG reference"}
            </button>
            <button
              type="button"
              onClick={() => setShowOverlayGuides((v) => !v)}
              className="rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-[12px] font-medium text-gray-900 hover:bg-gray-50"
            >
              {showOverlayGuides ? "Hide overlay guides" : "Show overlay guides"}
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-[linear-gradient(45deg,#f3f4f6_25%,transparent_25%),linear-gradient(-45deg,#f3f4f6_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f3f4f6_75%),linear-gradient(-45deg,transparent_75%,#f3f4f6_75%)] bg-[length:24px_24px] bg-[position:0_0,0_12px,12px_-12px,-12px_0px] p-3">
          <svg viewBox={`0 0 ${viewW} ${viewH}`} className="block h-auto w-full">
            <defs>
              <linearGradient id="frontGloss" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
                <stop offset="55%" stopColor="rgba(255,255,255,0.08)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.03)" />
              </linearGradient>
            </defs>

            {showReference && (
              <image
                href="/panel-reference.png"
                x="0"
                y="0"
                width={viewW}
                height={viewH}
                preserveAspectRatio="xMidYMid meet"
                opacity={0.6}
              />
            )}

            <ellipse
              cx={(D.x + C.x) / 2 + 6}
              cy={C.y + 10}
              rx={Math.max(70, (C.x - D.x) * 0.33)}
              ry={14}
              fill="rgba(0,0,0,0.12)"
            />

            <polygon points={topPoints} fill={active.top} stroke="#1f2937" strokeWidth={2} />
            <polygon points={sidePoints} fill={active.side} stroke="#111827" strokeWidth={2} />
            <polygon points={frontPoints} fill={active.face} stroke="#374151" strokeWidth={2} />
            <polygon points={frontPoints} fill="url(#frontGloss)" pointerEvents="none" />

            {fins.map((fin, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <g key={i}>
                <polygon
                  points={`${fin.front1.x},${fin.front1.y} ${fin.front2.x},${fin.front2.y} ${fin.back2.x},${fin.back2.y} ${fin.back1.x},${fin.back1.y}`}
                  fill={active.top}
                  stroke="#1f2937"
                  strokeWidth={1.6}
                />
                <line
                  x1={fin.front2.x}
                  y1={fin.front2.y}
                  x2={fin.back2.x}
                  y2={fin.back2.y}
                  stroke="#111827"
                  strokeWidth={1.2}
                />
              </g>
            ))}

            {showOverlayGuides && (
              <>
                <polygon
                  points={frontPoints}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                />
                <polygon
                  points={sidePoints}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                />
                <polygon
                  points={topPoints}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                />
              </>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}

function buildGridPanels(
  idPrefix: string,
  rows: number,
  cols: number,
  tl: { x: number; y: number },
  tr: { x: number; y: number },
  bl: { x: number; y: number },
  br: { x: number; y: number }
): PanelDef[] {
  const panels: PanelDef[] = [];

  for (let r = 0; r < rows; r += 1) {
    const tTop0 = r / rows;
    const tTop1 = (r + 1) / rows;

    const leftTop = lerpPoint(tl.x, tl.y, bl.x, bl.y, tTop0);
    const rightTop = lerpPoint(tr.x, tr.y, br.x, br.y, tTop0);
    const leftBottom = lerpPoint(tl.x, tl.y, bl.x, bl.y, tTop1);
    const rightBottom = lerpPoint(tr.x, tr.y, br.x, br.y, tTop1);

    for (let c = 0; c < cols; c += 1) {
      const s0 = c / cols;
      const s1 = (c + 1) / cols;

      const p1 = lerpPoint(leftTop.x, leftTop.y, rightTop.x, rightTop.y, s0);
      const p2 = lerpPoint(leftTop.x, leftTop.y, rightTop.x, rightTop.y, s1);
      const p3 = lerpPoint(leftBottom.x, leftBottom.y, rightBottom.x, rightBottom.y, s1);
      const p4 = lerpPoint(leftBottom.x, leftBottom.y, rightBottom.x, rightBottom.y, s0);

      panels.push({
        id: `${idPrefix}-R${r + 1}-C${c + 1}`,
        pts: `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`,
      });
    }
  }

  return panels;
}

function ProjectExampleMahwahFord({ activeHex }: ProjectExampleProps) {
  const [depthInches, setDepthInches] = useState(2);

  const scene = useMemo(() => {
    const viewW = 520;
    const viewH = 320;

    // background wall
    const wall = {
      x: 60,
      y: 40,
      width: 400,
      height: 240,
    };

    // base panel geometry (front face)
    const baseA = { x: 190, y: 80 };
    const baseB = { x: 340, y: 120 };
    const baseC = { x: 340, y: 240 };
    const baseD = { x: 190, y: 200 };

    const depthScale = depthInches / 3;
    const offset = {
      x: 26 * depthScale,
      y: -12 * depthScale,
    };

    const A = baseA;
    const B = baseB;
    const C = baseC;
    const D = baseD;

    const E = { x: C.x + offset.x, y: C.y + offset.y };
    const F = { x: B.x + offset.x, y: B.y + offset.y };
    const G = { x: A.x + offset.x, y: A.y + offset.y };

    const frontPts = `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y} ${D.x},${D.y}`;
    const sidePts = `${B.x},${B.y} ${C.x},${C.y} ${E.x},${E.y} ${F.x},${F.y}`;
    const topPts = `${A.x},${A.y} ${B.x},${B.y} ${F.x},${F.y} ${G.x},${G.y}`;

    return {
      viewW,
      viewH,
      wall,
      frontPts,
      sidePts,
      topPts,
      shadowCx: (D.x + C.x) / 2 + 6,
      shadowCy: C.y + 18,
      shadowRx: 70,
      shadowRy: 18,
    };
  }, [depthInches]);

  const faceColor = activeHex;
  const sideColor = "#4b5563";
  const topColor = "#374151";

  const { viewW, viewH, wall, frontPts, sidePts, topPts, shadowCx, shadowCy, shadowRx, shadowRy } =
    scene;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] text-gray-600">
        Single 3D ACM panel on a background wall. Color matches your selected panel color.
      </p>
      <div className="flex items-center gap-3">
        <label className="text-[12px] font-medium text-gray-900">Depth (projection)</label>
        <input
          type="range"
          min={1}
          max={4}
          step={0.5}
          value={depthInches}
          onChange={(e) => setDepthInches(Number(e.target.value))}
          className="flex-1"
        />
        <span className="text-[12px] text-gray-700 w-10 text-right">{depthInches.toFixed(1)} in</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-slate-900/90 p-3 shadow-inner">
        <svg viewBox={`0 0 ${viewW} ${viewH}`} className="block h-auto w-full">
          <defs>
            <linearGradient id="wallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1f2937" />
              <stop offset="55%" stopColor="#020617" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="panelGloss" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
              <stop offset="55%" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.08)" />
            </linearGradient>
          </defs>

          {/* background wall */}
          <rect
            x={wall.x}
            y={wall.y}
            width={wall.width}
            height={wall.height}
            fill="url(#wallGrad)"
            rx={18}
          />

          {/* subtle wall panel seams */}
          <g stroke="rgba(15,23,42,0.7)" strokeWidth={1}>
            <line
              x1={wall.x + wall.width * 0.33}
              y1={wall.y}
              x2={wall.x + wall.width * 0.33}
              y2={wall.y + wall.height}
            />
            <line
              x1={wall.x + wall.width * 0.66}
              y1={wall.y}
              x2={wall.x + wall.width * 0.66}
              y2={wall.y + wall.height}
            />
            <line
              x1={wall.x}
              y1={wall.y + wall.height * 0.4}
              x2={wall.x + wall.width}
              y2={wall.y + wall.height * 0.4}
            />
          </g>

          {/* ground shadow */}
          <ellipse
            cx={shadowCx}
            cy={shadowCy}
            rx={shadowRx}
            ry={shadowRy}
            fill="rgba(0,0,0,0.5)"
            opacity={0.5}
          />

          {/* top and side of panel */}
          <polygon points={topPts} fill={topColor} stroke="#020617" strokeWidth={2} />
          <polygon points={sidePts} fill={sideColor} stroke="#020617" strokeWidth={2} />

          {/* front face */}
          <polygon points={frontPts} fill={faceColor} stroke="#020617" strokeWidth={2} />
          <polygon points={frontPts} fill="url(#panelGloss)" />
        </svg>
      </div>
    </div>
  );
}

export interface PriceResult {
  areaFt2: number;
  totalSqFt: number;
  pricePerSqFt: number;
  total: number;
  panelType: PanelType;
  panelTypeLabel: string;
}

const DEBOUNCE_MS = 300;

function buildPriceBody(
  size: SizeSelection,
  thicknessId: ThicknessId,
  colorId: ColorId,
  qty: number,
  panelType: PanelType
) {
  const thicknessMm = Number(thicknessId.replace("mm", ""));
  return {
    widthIn: size.widthIn,
    lengthIn: size.lengthIn,
    thicknessMm,
    colorId,
    qty,
    panelType,
  };
}

export function Configurator() {
  const [size, setSize] = useState<SizeSelection>(defaultSize);
  const [colorId, setColorId] = useState<ColorId>("classic-white");
  const [thicknessId, setThicknessId] = useState<ThicknessId>("4mm");
  const [quantity, setQuantity] = useState(1);
  const [panelType, setPanelType] = useState<PanelType>("basic");

  const [pricing, setPricing] = useState<PriceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [panelDrawingFile, setPanelDrawingFile] = useState<File | null>(null);
  const router = useRouter();
  const { addItem } = useCart();

  const fetchPrice = useCallback(
    async (
      sizeVal: SizeSelection,
      thickness: ThicknessId,
      color: ColorId,
      qty: number,
      pType: PanelType
    ) => {
      const body = buildPriceBody(sizeVal, thickness, color, qty, pType);
      const res = await fetch("/api/price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to get price.");
      }
      return data as PriceResult;
    },
    []
  );

  useEffect(() => {
    setLoading(true);
    setError(null);
    const t = setTimeout(() => {
      fetchPrice(size, thicknessId, colorId, quantity, panelType)
        .then(setPricing)
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Something went wrong.");
          setPricing(null);
        })
        .finally(() => setLoading(false));
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [size, thicknessId, colorId, quantity, panelType, fetchPrice]);

  const color = colors.find((c) => c.id === colorId)!;
  const selectedWidth = allWidths.find((w) => w.id === size.widthId);
  const widthLabel = `${size.widthIn}"`;
  const thicknessMmNumeric = Number(thicknessId.replace("mm", ""));
  const edgeThicknessPx = Math.min(18, Math.max(4, thicknessMmNumeric / 0.5));

  const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));
  const widthRatio =
    (clamp(size.widthIn, MIN_WIDTH_IN, MAX_WIDTH_IN) - MIN_WIDTH_IN) / (MAX_WIDTH_IN - MIN_WIDTH_IN || 1);
  const lengthRatio =
    (clamp(size.lengthIn, MIN_LENGTH_IN, MAX_LENGTH_IN) - MIN_LENGTH_IN) / (MAX_LENGTH_IN - MIN_LENGTH_IN || 1);

  const handleAddToCart = () => {
    if (!pricing) return;
    const finish = finishes[0];
    const unitPrice = pricing.total / quantity;
    addItem({
      widthIn: size.widthIn,
      heightIn: size.lengthIn,
      standardId: size.widthId,
      colorId,
      finishId: finish.id,
      thicknessId,
      quantity,
      unitPrice,
      areaFt2: pricing.areaFt2,
      panelType: pricing.panelType,
      panelTypeLabel: pricing.panelTypeLabel,
    });
    router.push("/cart");
  };

  const handleRequestQuote = () => {
    if (!pricing) return;
    const finish = finishes[0];
    const thickness = thicknesses.find((t) => t.id === thicknessId);
    const draft: QuoteDraft = {
      widthIn: size.widthIn,
      lengthIn: size.lengthIn,
      widthId: size.widthId,
      thicknessId,
      colorId,
      finishId: finish.id,
      quantity,
      areaFt2PerPanel: pricing.areaFt2,
      totalSqFt: pricing.totalSqFt,
      estimatedTotal: pricing.total,
      panelType: pricing.panelType,
      panelTypeLabel: pricing.panelTypeLabel,
      widthLabel,
      thicknessLabel: thickness?.label ?? thicknessId,
      colorName: color.name,
      colorCode: color.code,
      finishLabel: finish.label,
      colorAvailability: color.availability,
      colorLeadTimeDaysRange: color.leadTimeDaysRange,
      widthAvailability: selectedWidth?.availability ?? "Made to Order",
      widthLeadTimeDaysRange: selectedWidth?.leadTimeDaysRange ?? [7, 14],
      productKind: "acm",
      productLabel: "ACM Panels",
      returnUrl: "/products/acm-panels",
    };
    if (typeof window !== "undefined") {
      sessionStorage.setItem(QUOTE_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    }
    router.push("/quote");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="mb-12 md:mb-16">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          ACM Panel Configurator
        </h1>
        <p className="mt-2 text-[15px] text-gray-500">
          Configure your panels. Pricing updates automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <section className="rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="border-b border-gray-100 px-6 py-5 md:px-8">
              <h2 className="text-[13px] font-medium uppercase tracking-wider text-gray-500">
                Configuration
              </h2>
              <p className="mt-0.5 text-[13px] text-gray-500">
                Choose thickness, size, color, and quantity.
              </p>
            </div>
            <div className="divide-y divide-gray-100 px-6 py-6 md:px-8">
              <div id="panel-type" className="pb-6 scroll-mt-24">
                <PanelTypePicker value={panelType} onChange={setPanelType} />
                {panelType === "custom" && (
                  <div className="mt-4 rounded-xl border border-gray-200/80 bg-gray-50/50 p-4">
                    <p className="text-[13px] text-gray-700">Non-square panels will need drawings.</p>
                    <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[14px] font-medium text-gray-900 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-gray-400 focus-within:ring-offset-2">
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        className="sr-only"
                        onChange={(e) => setPanelDrawingFile(e.target.files?.[0] ?? null)}
                      />
                      Upload panel drawing
                    </label>
                    {panelDrawingFile && (
                      <p className="mt-2 text-[12px] text-gray-600">{panelDrawingFile.name}</p>
                    )}
                  </div>
                )}
              </div>
              <div id="thickness" className="py-6 scroll-mt-24">
                <ThicknessPicker value={thicknessId} onChange={setThicknessId} />
              </div>
              <div id="size" className="py-6 scroll-mt-24">
                <SizePicker value={size} onChange={setSize} thicknessId={thicknessId} />
              </div>
              <div id="color" className="py-6 scroll-mt-24">
                <ColorSwatches value={colorId} onChange={setColorId} />
              </div>
              <div id="quantity" className="pt-6 scroll-mt-24">
                <QuantityPicker value={quantity} onChange={setQuantity} />
              </div>
            </div>
          </section>
        </div>

        <div id="estimate" className="lg:col-span-5 scroll-mt-24">
          <div className="lg:sticky lg:top-28 space-y-5">
            <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:p-6" aria-labelledby="panel-preview-heading">
              <h2 id="panel-preview-heading" className="text-[13px] font-medium uppercase tracking-wider text-gray-500">
                Panel Preview
              </h2>
              <div className="mt-4">
                <div
                  className="relative w-full overflow-hidden rounded-2xl"
                  style={{
                    aspectRatio: "4 / 3",
                  }}
                  role="img"
                  aria-label={`Facade preview: ${size.widthIn} by ${size.lengthIn} inch panels in ${color.name} (${color.code}), ${finishes[0].label}, ${
                    thicknesses.find((t) => t.id === thicknessId)?.label ?? thicknessId
                  }`}
                >
                  {/* Facade drawing background */}
                  <div
                    className="absolute inset-0 rounded-2xl border border-gray-300/70 bg-cover bg-center"
                    style={{
                      backgroundImage: "url('/panel-preview-facade.png')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  {/* Color overlay applied to panel areas */}
                  <div
                    className="absolute inset-[10%] rounded-xl"
                    style={{
                      backgroundColor: color.hex,
                      mixBlendMode: "multiply",
                      opacity: 0.82,
                    }}
                  />
                  {/* Soft vignette to keep edges subtle */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 0%, rgba(255,255,255,0.65) 0%, transparent 55%), radial-gradient(circle at 100% 120%, rgba(15,23,42,0.32) 0%, transparent 60%)",
                    }}
                  />

                  {/* Horizontal scale (width) */}
                  <div className="pointer-events-none absolute bottom-2 left-[18%] right-[14%]">
                    <div className="relative h-5">
                      <div className="absolute bottom-2 left-0 h-[1px] w-full bg-gray-400/70" />
                      <div className="absolute bottom-1 left-0 h-2 w-[1px] bg-gray-500" />
                      <div className="absolute bottom-1 right-0 h-2 w-[1px] bg-gray-500" />
                      <div
                        className="absolute bottom-2 left-1/2 h-[3px] -translate-x-1/2 rounded-full bg-gray-700"
                        style={{ width: `${35 + widthRatio * 45}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] font-medium text-gray-700 text-center">
                      Width: {size.widthIn.toFixed(0)} in (scaled)
                    </p>
                  </div>

                  {/* Vertical scale (length) */}
                  <div className="pointer-events-none absolute top-[18%] bottom-[20%] left-[10%] flex flex-col items-center justify-between">
                    <div className="relative h-full w-8">
                      <div className="absolute left-1/2 top-0 h-full w-[1px] -translate-x-1/2 bg-gray-400/70" />
                      <div className="absolute left-1/2 top-0 h-2 w-[1px] -translate-x-1/2 bg-gray-500" />
                      <div className="absolute left-1/2 bottom-0 h-2 w-[1px] -translate-x-1/2 bg-gray-500" />
                      <div
                        className="absolute left-1/2 top-1/2 w-[3px] -translate-x-1/2 rounded-full bg-gray-700"
                        style={{ height: `${32 + lengthRatio * 48}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] font-medium text-gray-700 text-center">
                      Length: {size.lengthIn.toFixed(0)} in (scaled)
                    </p>
                  </div>

                  {/* Label chip */}
                  <div className="absolute top-3 right-3 max-w-[70%] rounded-lg bg-white/90 px-2.5 py-1.5 text-[10px] font-medium text-gray-700 shadow-[0_1px_3px_rgba(0,0,0,0.18)] backdrop-blur-md">
                    <p className="leading-snug">
                      {color.name} ({color.code}) · {thicknesses.find((t) => t.id === thicknessId)?.label ?? thicknessId}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[13px] text-gray-600">
                  {size.widthIn} × {size.lengthIn} in · {(pricing?.areaFt2 ?? 0).toFixed(2)} ft² per panel
                </p>
              </div>
            </section>
            <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:p-6">
              <h2 className="text-[13px] font-medium uppercase tracking-wider text-gray-500">
                Project Example
              </h2>
              <div className="mt-4">
                <ProjectExampleMahwahFord activeHex={color.hex} />
              </div>
            </section>
            <PriceSummary
              pricing={pricing}
              loading={loading}
              error={error}
            />
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={loading || !!error || !pricing}
              className="w-full rounded-xl bg-gray-900 px-5 py-4 text-[15px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>

      <section className="mt-20 border-t border-gray-200/80 pt-16" aria-labelledby="material-composition-heading">
        <h2 id="material-composition-heading" className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          Material Composition
        </h2>
        <p className="mt-2 text-[15px] text-gray-500">
          Fire-resistant metal composite material (FR MCM) uses a mineral-filled core in place of plastic, meeting stringent fire ratings for exterior applications. The sandwich construction—aluminum skins bonded to a non-combustible core—delivers durability, formability, and compliance with building codes.
        </p>
        <div className="mt-10 flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-center">
          <MaterialCompositionDiagram />
        </div>
      </section>

      <section className="mt-20 border-t border-gray-200/80 pt-16" aria-labelledby="technical-resources-heading">
        <h2 id="technical-resources-heading" className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          Technical Resources
        </h2>
        <p className="mt-2 text-[15px] text-gray-500">
          Specifications, finishes, and support documentation.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/resources/alfrex-fr-technical-data-sheet"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors hover:border-gray-300/80 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            <h3 className="text-[15px] font-medium text-gray-900 group-hover:text-gray-800">Alfrex FR Technical Data Sheet</h3>
            <span className="mt-2 inline-block text-[13px] text-gray-500 group-hover:text-gray-700">View PDF →</span>
          </Link>
          <Link
            href="/resources/alfrex-standard-finishes-catalog"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors hover:border-gray-300/80 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            <h3 className="text-[15px] font-medium text-gray-900 group-hover:text-gray-800">Alfrex Standard Finishes Catalog</h3>
            <span className="mt-2 inline-block text-[13px] text-gray-500 group-hover:text-gray-700">View PDF →</span>
          </Link>
          <Link
            href="/resources/installation-guidelines"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors hover:border-gray-300/80 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            <h3 className="text-[15px] font-medium text-gray-900 group-hover:text-gray-800">Installation Guidelines</h3>
            <span className="mt-2 inline-block text-[13px] text-gray-500 group-hover:text-gray-700">View PDF →</span>
          </Link>
          <Link
            href="/resources/warranty-information"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors hover:border-gray-300/80 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            <h3 className="text-[15px] font-medium text-gray-900 group-hover:text-gray-800">Warranty Information</h3>
            <span className="mt-2 inline-block text-[13px] text-gray-500 group-hover:text-gray-700">View PDF →</span>
          </Link>
        </div>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
          <Link
            href="/resources/alfrex-fr-spec-sheet.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-xl bg-gray-900 px-6 py-3.5 text-[15px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            View the official Alfrex FR spec sheet (PDF)
          </Link>
          <Link
            href="/consultation"
            className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-[15px] font-medium text-gray-900 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Need help specifying? Upload plans for consultation.
          </Link>
        </div>
      </section>

      <section className="mt-20 border-t border-gray-200/80 pt-16" aria-labelledby="trust-heading">
        <h2 id="trust-heading" className="sr-only">
          Product and service information
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h3 className="text-[15px] font-medium text-gray-900">FR Rated Panels</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">
              Fire-resistant ACM panels meet building codes for exterior applications.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h3 className="text-[15px] font-medium text-gray-900">Lead Times</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">
              Availability and lead times are confirmed with your final quote based on project size, finish selection, and delivery location.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h3 className="text-[15px] font-medium text-gray-900">Cut-to-Length</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">
              Custom lengths from 12 in to 300 in. Specify your size when configuring.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h3 className="text-[15px] font-medium text-gray-900">Nationwide Shipping</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">
              We ship across the US. Delivery options and pricing provided with your quote.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
