"use client";

import { useId, useMemo } from "react";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function hexToRgb(hex: string) {
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(clean, 16);
  if (Number.isNaN(num)) return { r: 220, g: 226, b: 230 };
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0"))
      .join("")
  );
}

function shadeColor(hex: string, percent: number) {
  const { r, g, b } = hexToRgb(hex);
  const factor = (100 + percent) / 100;
  return rgbToHex(r * factor, g * factor, b * factor);
}

function lightenColor(hex: string, percent: number) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(
    r + (255 - r) * (percent / 100),
    g + (255 - g) * (percent / 100),
    b + (255 - b) * (percent / 100)
  );
}

function polygonPoints(points: { x: number; y: number }[]) {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

export type PanelConfiguratorPhotoPreviewProps = {
  panelColor: string;
  panelWidthIn: number;
  panelHeightIn: number;
  panelDepthIn: number;
  compact?: boolean;
};

export function PanelConfiguratorPhotoPreview({
  panelColor,
  panelWidthIn,
  panelHeightIn,
  panelDepthIn,
  compact = false,
}: PanelConfiguratorPhotoPreviewProps) {
  const uid = useId().replace(/:/g, "");

  const colors = useMemo(
    () => ({
      front: panelColor,
      top: shadeColor(panelColor, -20),
      side: shadeColor(panelColor, -46),
      wallA: "#f7f7f6",
      wallB: "#ececeb",
      railA: "#e0e4e8",
      railB: "#b7bec6",
      railSlot: "rgba(120,128,138,0.52)",
      fastenerA: "#d9dee3",
      fastenerB: "#98a1aa",
      screw: "#7f8790",
      outline: "rgba(50,50,50,0.18)",
    }),
    [panelColor]
  );

  const scene = useMemo(() => {
    const viewW = 1400;
    const viewH = 1100;
    const panelLeft = 320;
    const panelTop = 360;
    const pxPerIn = 12.5;

    let panelW = panelWidthIn * pxPerIn;
    let panelH = panelHeightIn * pxPerIn;
    const maxW = 760;
    const maxH = 420;
    const minW = 180;
    const minH = 90;
    const fitScale = Math.min(1, maxW / panelW, maxH / panelH);
    panelW *= fitScale;
    panelH *= fitScale;
    panelW = clamp(panelW, minW, maxW);
    panelH = clamp(panelH, minH, maxH);

    const depth = clamp(panelDepthIn * 26, 14, 40);
    const skewY = clamp(depth * 0.36, 6, 16);
    const skewX = depth;

    const frontTL = { x: panelLeft, y: panelTop };
    const frontTR = { x: panelLeft + panelW, y: panelTop + skewY };
    const frontBR = { x: panelLeft + panelW, y: panelTop + skewY + panelH };
    const frontBL = { x: panelLeft, y: panelTop + panelH };
    const topBL = { x: panelLeft + skewX, y: panelTop - skewY };
    const topBR = { x: panelLeft + panelW + skewX, y: panelTop };
    const sideTR = { x: panelLeft + panelW + skewX, y: panelTop };
    const sideBR = { x: panelLeft + panelW + skewX, y: panelTop + panelH };

    const topRailY = panelTop + Math.max(22, panelH * 0.12);
    const bottomRailY = panelTop + panelH - Math.max(16, panelH * 0.08);
    const leftFastenerX = panelLeft - 54;
    const rightFastenerX = panelLeft + panelW + 18;
    const leftTopFastenerY = topRailY - 18;
    const leftBottomFastenerY = bottomRailY - 18;
    const rightTopFastenerY = topRailY - 2;
    const rightBottomFastenerY = bottomRailY - 2;

    const shadowDx = clamp(depth * 0.42, 6, 18);
    const shadowDy = clamp(depth * 0.72, 10, 24);

    return {
      viewW,
      viewH,
      frontTL,
      frontTR,
      frontBR,
      frontBL,
      topBL,
      topBR,
      sideTR,
      sideBR,
      topRailY,
      bottomRailY,
      leftFastenerX,
      rightFastenerX,
      leftTopFastenerY,
      leftBottomFastenerY,
      rightTopFastenerY,
      rightBottomFastenerY,
      shadowDx,
      shadowDy,
      wasScaled: fitScale < 1,
    };
  }, [panelWidthIn, panelHeightIn, panelDepthIn]);

  const panelFaceGradId = `panelFaceGrad-${uid}`;
  const panelTopGradId = `panelTopGrad-${uid}`;
  const panelSideGradId = `panelSideGrad-${uid}`;
  const panelShadowId = `panelShadow-${uid}`;

  return (
    <div className={compact ? "flex flex-col gap-1.5" : "flex flex-col gap-2"}>
      {!compact && (
        <p className="text-[13px] text-gray-600">
          The panel in the scene changes size and color — no separate overlay.
        </p>
      )}
      {compact && (
        <p className="text-[11px] leading-snug text-gray-600">
          Panel color & size match your selection.
        </p>
      )}

      <div
        className="overflow-hidden rounded-xl border border-gray-200 bg-[#eef1f4] shadow-inner"
        style={{ aspectRatio: "1400 / 1100" }}
      >
        <svg
          viewBox={`0 0 ${scene.viewW} ${scene.viewH}`}
          className="block h-auto w-full"
          role="img"
          aria-label={`ACM panel preview ${panelWidthIn} by ${panelHeightIn} inches`}
        >
          <defs>
            <linearGradient id={panelFaceGradId} x1="0%" y1="0%" x2="1" y2="1">
              <stop offset="0%" stopColor={lightenColor(colors.front, 8)} />
              <stop offset="100%" stopColor={shadeColor(colors.front, -8)} />
            </linearGradient>
            <linearGradient id={panelTopGradId} x1="0%" y1="0%" x2="0%" y2="1">
              <stop offset="0%" stopColor={lightenColor(colors.top, 7)} />
              <stop offset="100%" stopColor={shadeColor(colors.top, -12)} />
            </linearGradient>
            <linearGradient id={panelSideGradId} x1="0%" y1="0%" x2="1" y2="1">
              <stop offset="0%" stopColor={lightenColor(colors.side, 6)} />
              <stop offset="100%" stopColor={shadeColor(colors.side, -12)} />
            </linearGradient>
            <filter id={panelShadowId} x="-30%" y="-30%" width="180%" height="180%">
              <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="rgba(0,0,0,0.14)" />
            </filter>
          </defs>

          <image
            href="/panel-preview-grid.png"
            x={0}
            y={0}
            width={scene.viewW}
            height={scene.viewH}
            preserveAspectRatio="none"
          />

          <g filter={`url(#${panelShadowId})`}>
            <polygon
              points={polygonPoints([
                { x: scene.frontTL.x + scene.shadowDx, y: scene.frontTL.y + scene.shadowDy },
                { x: scene.frontTR.x + scene.shadowDx, y: scene.frontTR.y + scene.shadowDy },
                { x: scene.frontBR.x + scene.shadowDx, y: scene.frontBR.y + scene.shadowDy },
                { x: scene.frontBL.x + scene.shadowDx, y: scene.frontBL.y + scene.shadowDy },
              ])}
              fill="rgba(0,0,0,0.09)"
              opacity={0.16}
            />

            <polygon
              points={polygonPoints([scene.frontTL, scene.frontTR, scene.topBR, scene.topBL])}
              fill={`url(#${panelTopGradId})`}
              stroke={colors.outline}
              strokeWidth="1.2"
            />
            <polygon
              points={polygonPoints([scene.frontTR, scene.topBR, scene.sideBR, scene.frontBR])}
              fill={`url(#${panelSideGradId})`}
              stroke={colors.outline}
              strokeWidth="1.2"
            />
            <polygon
              points={polygonPoints([scene.frontTL, scene.frontTR, scene.frontBR, scene.frontBL])}
              fill={`url(#${panelFaceGradId})`}
              stroke="rgba(255,255,255,0.58)"
              strokeWidth="2"
            />
            <polygon
              points={polygonPoints([
                { x: scene.frontTL.x + 10, y: scene.frontTL.y + 8 },
                { x: scene.frontTR.x - 10, y: scene.frontTR.y + 4 },
                { x: scene.frontBR.x - 10, y: scene.frontBR.y - 10 },
                { x: scene.frontBL.x + 10, y: scene.frontBL.y - 10 },
              ])}
              fill="none"
              stroke="rgba(255,255,255,0.24)"
              strokeWidth="2"
            />
          </g>
        </svg>
      </div>

      <p
        className={
          compact
            ? "text-center text-[10px] font-semibold tabular-nums text-gray-700"
            : "text-center text-[12px] font-semibold tabular-nums text-gray-800"
        }
      >
        {panelWidthIn}" × {panelHeightIn}" · {panelDepthIn.toFixed(2)}" deep
      </p>

      {scene.wasScaled && (
        <p
          className={
            compact
              ? "rounded-lg border border-[#f5d28c] bg-[#fff8e8] px-2 py-1.5 text-[10px] leading-snug text-[#9a6400]"
              : "rounded-xl border border-[#f5d28c] bg-[#fff8e8] px-3 py-2 text-[13px] text-[#9a6400]"
          }
        >
          Preview scaled slightly to fit this scene.
        </p>
      )}
    </div>
  );
}
