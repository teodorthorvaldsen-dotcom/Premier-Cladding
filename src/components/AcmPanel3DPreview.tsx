"use client";

import { useMemo, type CSSProperties } from "react";

const PREVIEW_W = 520;
const PREVIEW_H = 360;

export interface AcmPanel3DPreviewProps {
  panelWidthIn: number;
  panelHeightIn: number;
  /** Visual depth in inches (may be scaled from real thickness for readability). */
  panelDepthIn: number;
  panelColorHex: string;
}

export function AcmPanel3DPreview({
  panelWidthIn,
  panelHeightIn,
  panelDepthIn,
  panelColorHex,
}: AcmPanel3DPreviewProps) {
  const scaled = useMemo(() => {
    const baseW = panelWidthIn * 6;
    const baseH = panelHeightIn * 3.2;
    const depthPx = panelDepthIn * 16;

    const totalW = baseW + depthPx + 40;
    const totalH = baseH + depthPx + 40;

    const scaleX = (PREVIEW_W - 80) / totalW;
    const scaleY = (PREVIEW_H - 80) / totalH;
    const scale = Math.min(scaleX, scaleY, 1);

    return {
      faceW: baseW * scale,
      faceH: baseH * scale,
      depth: Math.max(depthPx * scale, 6),
    };
  }, [panelWidthIn, panelHeightIn, panelDepthIn]);

  const { frontColor, sideColor, topColor, borderColor } = useMemo(
    () => createPanelShades(panelColorHex),
    [panelColorHex]
  );

  const wrapStyle: CSSProperties = {
    ...staticStyles.panel3dWrap,
    width: scaled.faceW,
    height: scaled.faceH,
  };

  const topStyle: CSSProperties = {
    ...staticStyles.panelTop,
    width: scaled.faceW,
    height: scaled.depth,
    background: topColor,
    borderColor,
    transform: `translateY(-${scaled.depth}px) skewX(-45deg)`,
  };

  const sideStyle: CSSProperties = {
    ...staticStyles.panelSide,
    width: scaled.depth,
    height: scaled.faceH,
    background: sideColor,
    borderColor,
    transform: `translateX(${scaled.faceW}px) skewY(-45deg)`,
  };

  const frontStyle: CSSProperties = {
    ...staticStyles.panelFront,
    width: scaled.faceW,
    height: scaled.faceH,
    background: `linear-gradient(145deg, ${frontColor} 0%, ${panelColorHex} 55%, ${sideColor} 100%)`,
    borderColor,
  };

  return (
    <section
      className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:p-4"
      aria-labelledby="acm-panel-3d-preview-heading"
    >
      <h2
        id="acm-panel-3d-preview-heading"
        className="text-[13px] font-medium uppercase tracking-wider text-gray-500"
      >
        Panel Preview
      </h2>
      <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
        Schematic preview from your width, height, thickness, and color. Scale is normalized to fit this box.
      </p>

      <div
        className="mx-auto mt-3 overflow-hidden rounded-xl"
        style={{
          height: PREVIEW_H,
          maxWidth: PREVIEW_W,
          background: "linear-gradient(180deg, #ffffff 0%, #fbfbfc 100%)",
        }}
      >
        <div style={staticStyles.previewCenter}>
          <div style={wrapStyle}>
            <div style={topStyle} />
            <div style={sideStyle} />
            <div style={frontStyle}>
              <div style={staticStyles.panelGloss} />
              <div style={staticStyles.panelInnerBorder} />
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 border-t border-gray-100 pt-3 text-center text-[13px] font-medium text-gray-500">
        Scaled preview: {panelWidthIn}&quot; × {panelHeightIn}&quot; × {panelDepthIn}&quot; deep (illustrative)
      </p>
    </section>
  );
}

function createPanelShades(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return {
      frontColor: "#6b7280",
      sideColor: "#4b5563",
      topColor: "#9ca3af",
      borderColor: "#374151",
    };
  }

  return {
    frontColor: adjustColor(rgb, 20),
    sideColor: adjustColor(rgb, -35),
    topColor: adjustColor(rgb, 35),
    borderColor: adjustColor(rgb, -55),
  };
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "").trim();

  if (!/^([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(clean)) return null;

  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;

  const num = parseInt(full, 16);

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function adjustColor({ r, g, b }: { r: number; g: number; b: number }, amount: number) {
  const clamp = (n: number) => Math.max(0, Math.min(255, n + amount));
  return `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`;
}

const staticStyles: Record<string, CSSProperties> = {
  previewCenter: {
    position: "relative",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    boxSizing: "border-box",
  },
  panel3dWrap: {
    position: "relative",
    transform: "rotateX(0deg) rotateY(0deg)",
    filter: "drop-shadow(0 24px 40px rgba(0,0,0,0.14))",
  },
  panelFront: {
    position: "relative",
    border: "1px solid",
    borderRadius: "2px",
    overflow: "hidden",
  },
  panelTop: {
    position: "absolute",
    left: 0,
    top: 0,
    transformOrigin: "bottom left",
    border: "1px solid",
    borderBottom: "none",
    borderRadius: "2px 2px 0 0",
  },
  panelSide: {
    position: "absolute",
    top: 0,
    left: 0,
    transformOrigin: "top left",
    border: "1px solid",
    borderLeft: "none",
    borderRadius: "0 2px 2px 0",
  },
  panelGloss: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.10) 18%, rgba(255,255,255,0.02) 45%, rgba(255,255,255,0) 60%)",
    pointerEvents: "none",
  },
  panelInnerBorder: {
    position: "absolute",
    inset: "10px",
    border: "1px solid rgba(255,255,255,0.18)",
    pointerEvents: "none",
  },
};
