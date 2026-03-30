"use client";

import { useMemo, type CSSProperties } from "react";

const PREVIEW_W = 520;
const PREVIEW_H = 360;

const FLAT_LEN_SCALE = 3.2;
const FLAT_WIDTH_SCALE = 6;
const DEPTH_MULT = 16;

const SCENE_TILT = "rotateX(-11deg) rotateY(32deg)";

export type PanelBendAxis = "x" | "y";

export interface AcmPanel3DPreviewProps {
  panelWidthIn: number;
  panelHeightIn: number;
  /** Visual depth in inches (may be scaled from real thickness for readability). */
  panelDepthIn: number;
  /** Bend hinge direction: X splits length (horizontal hinge); Y splits width (vertical hinge). */
  bendAxis?: PanelBendAxis;
  /** Included angle between the two legs (0–180°). Outside ~1–179° shows an L in 3D. */
  bendAngleDeg?: number;
  /**
   * Inches from reference edge to fold along the split dimension (length for X, width for Y).
   * Defaults to half the panel when omitted.
   */
  bendInchesFromEdge?: number;
  panelColorHex: string;
  panelColorName: string;
  panelSwatchImage?: string;
}

export function AcmPanel3DPreview({
  panelWidthIn,
  panelHeightIn,
  panelDepthIn,
  bendAxis = "x",
  bendAngleDeg = 0,
  bendInchesFromEdge: bendInchesFromEdgeProp,
  panelColorHex,
  panelColorName,
  panelSwatchImage,
}: AcmPanel3DPreviewProps) {
  const scaled = useMemo(() => {
    const baseW = panelWidthIn * FLAT_WIDTH_SCALE;
    const baseH = panelHeightIn * FLAT_LEN_SCALE;
    const depthPx = panelDepthIn * DEPTH_MULT;
    const isBent = bendAngleDeg > 0.5 && bendAngleDeg < 179.5;
    const foldRad = ((180 - bendAngleDeg) * Math.PI) / 180;

    const splitAlongIn = bendAxis === "x" ? panelHeightIn : panelWidthIn;
    const bendIn =
      bendInchesFromEdgeProp !== undefined ? bendInchesFromEdgeProp : splitAlongIn / 2;
    const leg1Ratio = Math.min(0.999, Math.max(0.001, bendIn / splitAlongIn));

    let spanW = baseW + depthPx + 40;
    let spanH = baseH + depthPx + 40;

    if (isBent) {
      if (bendAxis === "x") {
        const h1 = baseH * leg1Ratio;
        const h2 = baseH * (1 - leg1Ratio);
        spanH =
          h1 +
          Math.abs(h2 * Math.cos(foldRad)) +
          Math.abs(depthPx * Math.sin(foldRad)) +
          depthPx +
          48;
        spanW = baseW + depthPx + 40;
      } else {
        const w1 = baseW * leg1Ratio;
        const w2 = baseW * (1 - leg1Ratio);
        spanW =
          w1 +
          Math.abs(w2 * Math.cos(foldRad)) +
          Math.abs(depthPx * Math.sin(foldRad)) +
          depthPx +
          48;
        spanH = baseH + depthPx + 40;
      }
    }

    const scaleX = (PREVIEW_W - 80) / spanW;
    const scaleY = (PREVIEW_H - 80) / spanH;
    const scale = Math.min(scaleX, scaleY, 1);

    return {
      faceW: baseW * scale,
      faceH: baseH * scale,
      depth: Math.max(depthPx * scale, 6),
      isBent,
      /** Rotation from coplanar: 180° − interior bend angle. */
      foldDeg: 180 - bendAngleDeg,
      leg1Ratio,
    };
  }, [
    panelWidthIn,
    panelHeightIn,
    panelDepthIn,
    bendAngleDeg,
    bendAxis,
    bendInchesFromEdgeProp,
  ]);

  const shades = useMemo(() => createPanelShades(panelColorHex), [panelColorHex]);

  const flatStyles = useMemo(() => {
    return buildFaceStyles(
      scaled.faceW,
      scaled.faceH,
      scaled.depth,
      panelColorHex,
      shades,
      panelSwatchImage
    );
  }, [scaled.depth, scaled.faceH, scaled.faceW, panelColorHex, panelSwatchImage, shades]);

  const caption = (() => {
    const size = `${panelWidthIn}" × ${panelHeightIn}"`;
    if (scaled.isBent) {
      const foldIn =
        bendInchesFromEdgeProp !== undefined
          ? bendInchesFromEdgeProp
          : (bendAxis === "x" ? panelHeightIn : panelWidthIn) / 2;
      return `L-bend ${bendAngleDeg}° · fold ${foldIn}" from edge · axis ${bendAxis.toUpperCase()} · ${size} · ${panelColorName}`;
    }
    return `${size} · ${panelColorName}`;
  })();

  return (
    <section
      className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:p-4"
      aria-labelledby="acm-panel-3d-preview-heading"
    >
      <h2
        id="acm-panel-3d-preview-heading"
        className="text-[15px] font-medium uppercase tracking-wider text-gray-500"
      >
        Panel Preview
      </h2>

      <div
        className="mx-auto mt-3 overflow-hidden rounded-xl"
        style={{
          height: PREVIEW_H,
          maxWidth: PREVIEW_W,
          background: "linear-gradient(180deg, #ffffff 0%, #fbfbfc 100%)",
        }}
      >
        <div
          style={{
            ...staticStyles.previewCenter,
            perspective: scaled.isBent ? "850px" : undefined,
          }}
        >
          {scaled.isBent ? (
            <BentLAssembly
              faceW={scaled.faceW}
              faceH={scaled.faceH}
              depth={scaled.depth}
              foldDeg={scaled.foldDeg}
              axis={bendAxis}
              leg1Ratio={scaled.leg1Ratio}
              panelColorHex={panelColorHex}
              panelSwatchImage={panelSwatchImage}
            />
          ) : (
            <div style={{ ...staticStyles.previewCenterInner, perspective: undefined }}>
              <div style={flatStyles.wrapStyle}>
                <div style={flatStyles.topStyle} />
                <div style={flatStyles.sideStyle} />
                <div style={flatStyles.frontStyle}>
                  <div style={staticStyles.panelGloss} />
                  {!panelSwatchImage ? <div style={staticStyles.panelInnerBorder} /> : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="mt-3 border-t border-gray-100 pt-3 text-center text-[15px] font-medium text-gray-500">
        {caption}
      </p>
    </section>
  );
}

function BentLAssembly({
  faceW,
  faceH,
  depth,
  foldDeg,
  axis,
  leg1Ratio,
  panelColorHex,
  panelSwatchImage,
}: {
  faceW: number;
  faceH: number;
  depth: number;
  foldDeg: number;
  axis: PanelBendAxis;
  /** Share of the split dimension for the first leg (below the fold for X, left for Y). */
  leg1Ratio: number;
  panelColorHex: string;
  panelSwatchImage?: string;
}) {
  const h1 = axis === "x" ? faceH * leg1Ratio : faceH;
  const h2 = axis === "x" ? faceH * (1 - leg1Ratio) : faceH;
  const w1 = axis === "y" ? faceW * leg1Ratio : faceW;
  const w2 = axis === "y" ? faceW * (1 - leg1Ratio) : faceW;

  return (
    <div style={staticStyles.previewCenterInner}>
      <div
        style={{
          transformStyle: "preserve-3d",
          transform: SCENE_TILT,
        }}
      >
        {axis === "x" ? (
          <div style={{ position: "relative", transformStyle: "preserve-3d" }}>
            <PanelPrism
              faceW={faceW}
              faceH={h1}
              depth={depth}
              panelColorHex={panelColorHex}
              panelSwatchImage={panelSwatchImage}
            />
            <div
              style={{
                position: "absolute",
                top: h1,
                left: 0,
                width: faceW,
                transformStyle: "preserve-3d",
                transformOrigin: "50% 0 0",
                transform: `rotateX(${foldDeg}deg)`,
              }}
            >
              <PanelPrism
                faceW={faceW}
                faceH={h2}
                depth={depth}
                panelColorHex={panelColorHex}
                panelSwatchImage={panelSwatchImage}
              />
            </div>
          </div>
        ) : (
          <div
            style={{
              position: "relative",
              transformStyle: "preserve-3d",
              width: faceW,
              height: faceH,
            }}
          >
            <div style={{ position: "absolute", left: 0, top: 0, transformStyle: "preserve-3d" }}>
              <PanelPrism
                faceW={w1}
                faceH={faceH}
                depth={depth}
                panelColorHex={panelColorHex}
                panelSwatchImage={panelSwatchImage}
              />
            </div>
            <div
              style={{
                position: "absolute",
                left: w1,
                top: 0,
                transformStyle: "preserve-3d",
                transformOrigin: "0 50% 0",
                transform: `rotateY(${-foldDeg}deg)`,
              }}
            >
              <PanelPrism
                faceW={w2}
                faceH={faceH}
                depth={depth}
                panelColorHex={panelColorHex}
                panelSwatchImage={panelSwatchImage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PanelPrism({
  faceW,
  faceH,
  depth,
  panelColorHex,
  panelSwatchImage,
}: {
  faceW: number;
  faceH: number;
  depth: number;
  panelColorHex: string;
  panelSwatchImage?: string;
}) {
  const shades = useMemo(() => createPanelShades(panelColorHex), [panelColorHex]);
  const { wrapStyle, topStyle, sideStyle, frontStyle } = useMemo(
    () => buildFaceStyles(faceW, faceH, depth, panelColorHex, shades, panelSwatchImage),
    [depth, faceH, faceW, panelColorHex, panelSwatchImage, shades]
  );

  return (
    <div style={{ ...wrapStyle, transformStyle: "preserve-3d" }}>
      <div style={topStyle} />
      <div style={sideStyle} />
      <div style={frontStyle}>
        <div style={staticStyles.panelGloss} />
        {!panelSwatchImage ? <div style={staticStyles.panelInnerBorder} /> : null}
      </div>
    </div>
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
  previewCenterInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transformStyle: "preserve-3d",
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
