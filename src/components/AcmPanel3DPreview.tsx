"use client";

import { useMemo, type CSSProperties } from "react";
import {
  bendAllowanceFromAngleInches,
  defaultInsideBendRadiusInches,
} from "@/lib/bendPreviewMath";

const PREVIEW_W = 520;
const PREVIEW_H = 360;

const FLAT_LEN_SCALE = 3.2;
const FLAT_WIDTH_SCALE = 6;
const DEPTH_MULT = 16;

export interface AcmPanel3DPreviewProps {
  panelWidthIn: number;
  panelHeightIn: number;
  /** Visual depth in inches (may be scaled from real thickness for readability). */
  panelDepthIn: number;
  /** Bend angle in degrees (0 = flat). Each straight leg uses half of panelHeightIn (fold at center). */
  bendAngleDeg?: number;
  /** Nominal metal / composite thickness in inches for neutral-axis bend allowance. */
  metalThicknessIn?: number;
  /** Horizontal mirror of bent geometry (left/right flip). */
  bendMirrored?: boolean;
  panelColorHex: string;
  panelColorName: string;
  panelSwatchImage?: string;
}

export function AcmPanel3DPreview({
  panelWidthIn,
  panelHeightIn,
  panelDepthIn,
  bendAngleDeg = 0,
  bendMirrored = false,
  metalThicknessIn = 0.16,
  panelColorHex,
  panelColorName,
  panelSwatchImage,
}: AcmPanel3DPreviewProps) {
  const shades = useMemo(() => createPanelShades(panelColorHex), [panelColorHex]);

  const bendAngle = Math.min(180, Math.max(0, bendAngleDeg));
  const useBend = bendAngle >= 0.5;

  const flatScaled = useMemo(() => {
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

  const insideRIn = defaultInsideBendRadiusInches(metalThicknessIn);
  const baIn = useMemo(
    () => bendAllowanceFromAngleInches(bendAngle, insideRIn, metalThicknessIn),
    [bendAngle, insideRIn, metalThicknessIn]
  );

  const bentLayout = useMemo(() => {
    if (!useBend) return null;
    const baseW = panelWidthIn * FLAT_WIDTH_SCALE;
    /** Half nominal length per leg — like folding the sheet in half at the bend. */
    const legLenIn = panelHeightIn * 0.5;
    const L1 = legLenIn * FLAT_LEN_SCALE;
    const L2 = L1;
    const depthPx = panelDepthIn * DEPTH_MULT;
    const thetaRad = (bendAngle * Math.PI) / 180;
    const reach = L1 + L2 * (Math.abs(Math.sin(thetaRad)) + Math.abs(Math.cos(thetaRad)) * 0.35);
    const span = baseW + depthPx * 1.35 + 56;
    const totalH = reach + depthPx * 1.15 + 44;
    const scaleX = (PREVIEW_W - 80) / span;
    const scaleY = (PREVIEW_H - 80) / totalH;
    const scale = Math.min(scaleX, scaleY, 1) * 0.9;

    return {
      faceW: baseW * scale,
      faceH1: L1 * scale,
      faceH2: L2 * scale,
      depth: Math.max(depthPx * scale * 1.32, 10),
    };
  }, [useBend, panelWidthIn, panelHeightIn, panelDepthIn, bendAngle]);

  const flatStyles = useMemo(
    () =>
      buildFaceStyles(
        flatScaled.faceW,
        flatScaled.faceH,
        flatScaled.depth,
        panelColorHex,
        shades,
        panelSwatchImage
      ),
    [
      flatScaled.depth,
      flatScaled.faceH,
      flatScaled.faceW,
      panelColorHex,
      panelSwatchImage,
      shades,
    ]
  );

  const bentStyles = useMemo(() => {
    if (!bentLayout) return null;
    const { faceW, faceH1, faceH2, depth } = bentLayout;
    return buildFaceStyles(
      faceW,
      Math.max(faceH1, faceH2),
      depth,
      panelColorHex,
      shades,
      panelSwatchImage,
      { solidBlock: true, wrapShadow: false }
    );
  }, [bentLayout, panelColorHex, panelSwatchImage, shades]);

  const caption = useMemo(() => {
    const base = `${panelWidthIn}" × ${panelHeightIn}"`;
    if (!useBend) return `${base} · ${panelColorName}`;
    const ba = baIn >= 0.001 ? ` · BA ≈ ${baIn.toFixed(3)}"` : "";
    const mir = bendMirrored ? " · mirrored" : "";
    return `${base} · ${Math.round(bendAngle)}° L-fold (½ length each leg)${ba}${mir} · ${panelColorName}`;
  }, [panelWidthIn, panelHeightIn, panelColorName, useBend, bendAngle, baIn, bendMirrored]);

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
        {!useBend || !bentLayout || !bentStyles ? (
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
        ) : (
          <div
            style={{
              ...staticStyles.previewCenter,
              perspective: "1100px",
              perspectiveOrigin: "48% 44%",
            }}
          >
            <div
              style={{
                transformStyle: "preserve-3d",
                /** View similar to solid L-block: foot reads toward the viewer, stem vertical. */
                transform: `rotateX(40deg) rotateY(-22deg) rotateZ(-30deg) translateY(14px)${
                  bendMirrored ? " scaleX(-1)" : ""
                }`,
                filter: "drop-shadow(0 28px 48px rgba(0,0,0,0.18))",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "relative",
                  transformStyle: "preserve-3d",
                  /**
                   * Built as Γ (bend at top of first leg). rotateZ(180°) about the bend (top center) yields
                   * a letter-L silhouette: stem down, foot out from the inside corner.
                   */
                  transform: "rotateZ(180deg)",
                  transformOrigin: "50% 0",
                }}
              >
                <ExtrudedLeg
                  depth={bentLayout.depth}
                  faceH={bentLayout.faceH1}
                  faceW={bentLayout.faceW}
                  showInnerBorder={!panelSwatchImage}
                  styles={bentStyles}
                />
                {/* Single sharp hinge (solid L / mitered block) — second leg rotates by full bend angle. */}
                <div
                  style={{
                    left: 0,
                    position: "absolute",
                    top: 0,
                    transform: `rotateX(${bendAngleDeg}deg)`,
                    transformOrigin: "50% 0 0",
                    transformStyle: "preserve-3d",
                    width: bentLayout.faceW,
                  }}
                >
                  <ExtrudedLeg
                    depth={bentLayout.depth}
                    faceH={bentLayout.faceH2}
                    faceW={bentLayout.faceW}
                    showInnerBorder={!panelSwatchImage}
                    styles={bentStyles}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="mt-3 border-t border-gray-100 pt-3 text-center text-[15px] font-medium text-gray-500">
        {caption}
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

function ExtrudedLeg({
  faceW,
  faceH,
  depth,
  styles,
  showInnerBorder,
}: {
  faceW: number;
  faceH: number;
  depth: number;
  styles: FaceStyles;
  showInnerBorder: boolean;
}) {
  return (
    <div style={{ ...styles.wrapStyle, height: faceH, position: "relative", width: faceW }}>
      <div style={{ ...styles.topStyle, height: depth, width: faceW }} />
      <div style={{ ...styles.sideStyle, height: faceH, width: depth }} />
      <div style={{ ...styles.frontStyle, height: faceH, width: faceW }}>
        <div style={staticStyles.panelGloss} />
        {showInnerBorder ? <div style={staticStyles.panelInnerBorder} /> : null}
      </div>
    </div>
  );
}

function buildFaceStyles(
  faceW: number,
  faceH: number,
  depth: number,
  panelColorHex: string,
  shades: ReturnType<typeof createPanelShades>,
  panelSwatchImage?: string,
  opts?: { wrapShadow?: boolean; solidBlock?: boolean }
): FaceStyles {
  const { frontColor, sideColor, topColor, borderColor } = shades;
  const wrapShadow = opts?.wrapShadow !== false;
  const solid = opts?.solidBlock === true;
  const rad = solid ? 5 : 2;

  const wrap: CSSProperties = {
    position: "relative",
    transform: "rotateX(0deg) rotateY(0deg)",
    width: faceW,
    height: faceH,
    ...(wrapShadow ? { filter: "drop-shadow(0 24px 40px rgba(0,0,0,0.14))" } : {}),
  };

  if (panelSwatchImage) {
    const url = `url(${panelSwatchImage})`;
    const gTop = solid ? "linear-gradient(165deg, rgba(255,255,255,0.2), rgba(0,0,0,0.32))" : "linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.4))";
    const gSide = solid ? "linear-gradient(200deg, rgba(255,255,255,0.06), rgba(0,0,0,0.42))" : "linear-gradient(90deg, rgba(0,0,0,0.15), rgba(0,0,0,0.38))";
    const gFront = solid
      ? `linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 35%, rgba(0,0,0,0.15) 100%), ${url}`
      : `linear-gradient(145deg, rgba(255,255,255,0.12) 0%, transparent 40%, rgba(0,0,0,0.06) 100%), ${url}`;
    return {
      wrapStyle: wrap,
      topStyle: {
        ...staticStyles.panelTop,
        width: faceW,
        height: depth,
        borderColor,
        borderRadius: `${rad}px ${rad}px 0 0`,
        transform: `translateY(-${depth}px) skewX(-45deg)`,
        backgroundImage: `${gTop}, ${url}`,
        backgroundSize: "cover, cover",
        backgroundPosition: "center, center",
        backgroundRepeat: "no-repeat, no-repeat",
      },
      sideStyle: {
        ...staticStyles.panelSide,
        width: depth,
        height: faceH,
        borderColor,
        borderRadius: `0 ${rad}px ${rad}px 0`,
        transform: `translateX(${faceW}px) skewY(-45deg)`,
        backgroundImage: `${gSide}, ${url}`,
        backgroundSize: "cover, cover",
        backgroundPosition: "center, center",
        backgroundRepeat: "no-repeat, no-repeat",
      },
      frontStyle: {
        ...staticStyles.panelFront,
        width: faceW,
        height: faceH,
        borderColor,
        borderRadius: `${rad}px`,
        backgroundImage: gFront,
        backgroundSize: "cover, cover",
        backgroundPosition: "center, center",
        backgroundRepeat: "no-repeat, no-repeat",
      },
    };
  }

  const rgb = hexToRgb(panelColorHex);
  const deep = rgb ? adjustColor(rgb, solid ? -48 : -35) : sideColor;

  return {
    wrapStyle: wrap,
    topStyle: {
      ...staticStyles.panelTop,
      width: faceW,
      height: depth,
      borderRadius: `${rad}px ${rad}px 0 0`,
      background: solid
        ? `linear-gradient(165deg, ${adjustColor(rgb ?? { r: 150, g: 150, b: 150 }, 22)}, ${deep})`
        : topColor,
      borderColor,
      transform: `translateY(-${depth}px) skewX(-45deg)`,
    },
    sideStyle: {
      ...staticStyles.panelSide,
      width: depth,
      height: faceH,
      borderRadius: `0 ${rad}px ${rad}px 0`,
      background: solid
        ? `linear-gradient(200deg, ${adjustColor(rgb ?? { r: 150, g: 150, b: 150 }, 8)}, ${deep})`
        : sideColor,
      borderColor,
      transform: `translateX(${faceW}px) skewY(-45deg)`,
    },
    frontStyle: {
      ...staticStyles.panelFront,
      width: faceW,
      height: faceH,
      borderRadius: `${rad}px`,
      background: solid
        ? `linear-gradient(128deg, ${rgb ? adjustColor(rgb, 28) : frontColor} 0%, ${panelColorHex} 45%, ${rgb ? adjustColor(rgb, -22) : sideColor} 92%)`
        : `linear-gradient(145deg, ${frontColor} 0%, ${panelColorHex} 55%, ${sideColor} 100%)`,
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
