"use client";

import { useMemo, type CSSProperties } from "react";

const PREVIEW_W = 520;
const PREVIEW_H = 300;

const FLAT_LEN_SCALE = 3.2;
const FLAT_WIDTH_SCALE = 6;
const DEPTH_MULT = 16;

export interface AcmPanelFlatPreviewProps {
  panelWidthIn: number;
  panelHeightIn: number;
  /** Visual depth in inches (scaled for readability). */
  panelDepthIn: number;
  panelColorHex: string;
  panelColorName: string;
  panelSwatchImage?: string;
}

export function AcmPanelFlatPreview({
  panelWidthIn,
  panelHeightIn,
  panelDepthIn,
  panelColorHex,
  panelColorName,
  panelSwatchImage,
}: AcmPanelFlatPreviewProps) {
  const scaled = useMemo(() => {
    const baseW = panelWidthIn * FLAT_WIDTH_SCALE;
    const baseH = panelHeightIn * FLAT_LEN_SCALE;
    const depthPx = panelDepthIn * DEPTH_MULT;

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

  const shades = useMemo(() => createPanelShades(panelColorHex), [panelColorHex]);

  const flatStyles = useMemo(
    () =>
      buildFaceStyles(
        scaled.faceW,
        scaled.faceH,
        scaled.depth,
        panelColorHex,
        shades,
        panelSwatchImage
      ),
    [scaled.depth, scaled.faceH, scaled.faceW, panelColorHex, panelSwatchImage, shades]
  );

  return (
    <section
      className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:p-4"
      aria-labelledby="acm-panel-flat-preview-heading"
    >
      <h2
        id="acm-panel-flat-preview-heading"
        className="text-[15px] font-medium uppercase tracking-wider text-gray-500"
      >
        Flat panel preview
      </h2>
      <p className="mt-0.5 text-xs text-gray-500">
        Rectangular sheet — color and size only (no fold).
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
          <div style={flatStyles.wrapStyle}>
            <div style={flatStyles.topStyle} />
            <div style={flatStyles.sideStyle} />
            <div style={flatStyles.frontStyle}>
              <div style={staticStyles.panelGloss} />
              {!panelSwatchImage ? <div style={staticStyles.panelInnerBorder} /> : null}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 border-t border-gray-100 pt-3 text-center text-[15px] font-medium text-gray-500">
        {panelWidthIn}&quot; × {panelHeightIn}&quot; · {panelColorName}
      </p>
    </section>
  );
}

type FaceStyles = {
  wrapStyle: CSSProperties;
  frontStyle: CSSProperties;
  topStyle: CSSProperties;
  sideStyle: CSSProperties;
};

function buildFaceStyles(
  faceW: number,
  faceH: number,
  depth: number,
  panelColorHex: string,
  shades: ReturnType<typeof createPanelShades>,
  panelSwatchImage?: string,
  opts?: { wrapShadow?: boolean }
): FaceStyles {
  const { frontColor, sideColor, topColor, borderColor } = shades;
  const wrapShadow = opts?.wrapShadow !== false;

  const wrap: CSSProperties = {
    position: "relative",
    transform: "rotateX(0deg) rotateY(0deg)",
    width: faceW,
    height: faceH,
    ...(wrapShadow ? { filter: "drop-shadow(0 24px 40px rgba(0,0,0,0.14))" } : {}),
  };

  if (panelSwatchImage) {
    const url = `url(${panelSwatchImage})`;
    return {
      wrapStyle: wrap,
      topStyle: {
        ...staticStyles.panelTop,
        width: faceW,
        height: depth,
        borderColor,
        transform: `translateY(-${depth}px) skewX(-45deg)`,
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.4)), ${url}`,
        backgroundSize: "cover, cover",
        backgroundPosition: "center, center",
        backgroundRepeat: "no-repeat, no-repeat",
      },
      sideStyle: {
        ...staticStyles.panelSide,
        width: depth,
        height: faceH,
        borderColor,
        transform: `translateX(${faceW}px) skewY(-45deg)`,
        backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.15), rgba(0,0,0,0.38)), ${url}`,
        backgroundSize: "cover, cover",
        backgroundPosition: "center, center",
        backgroundRepeat: "no-repeat, no-repeat",
      },
      frontStyle: {
        ...staticStyles.panelFront,
        width: faceW,
        height: faceH,
        borderColor,
        backgroundImage: `linear-gradient(145deg, rgba(255,255,255,0.12) 0%, transparent 40%, rgba(0,0,0,0.06) 100%), ${url}`,
        backgroundSize: "cover, cover",
        backgroundPosition: "center, center",
        backgroundRepeat: "no-repeat, no-repeat",
      },
    };
  }

  return {
    wrapStyle: wrap,
    topStyle: {
      ...staticStyles.panelTop,
      width: faceW,
      height: depth,
      background: topColor,
      borderColor,
      transform: `translateY(-${depth}px) skewX(-45deg)`,
    },
    sideStyle: {
      ...staticStyles.panelSide,
      width: depth,
      height: faceH,
      background: sideColor,
      borderColor,
      transform: `translateX(${faceW}px) skewY(-45deg)`,
    },
    frontStyle: {
      ...staticStyles.panelFront,
      width: faceW,
      height: faceH,
      background: `linear-gradient(145deg, ${frontColor} 0%, ${panelColorHex} 55%, ${sideColor} 100%)`,
      borderColor,
    },
  };
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
