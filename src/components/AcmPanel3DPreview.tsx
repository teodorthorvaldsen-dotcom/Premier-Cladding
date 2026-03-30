"use client";

import { Suspense, useLayoutEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Center, Edges, OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { PanelBendSpec } from "@/types/panelBend";
import { normalizePanelBends } from "@/lib/panelBends";

const PREVIEW_H = 360;
/** Same visual scale as prior CSS preview (inches → scene units). */
const INCH_TO_WORLD = 0.05;
const MIN_LEG_IN = 0.5;

export interface AcmPanel3DPreviewProps {
  panelWidthIn: number;
  panelHeightIn: number;
  panelDepthIn: number;
  /** Folds along length from the reference edge, in order. */
  bends?: PanelBendSpec[];
  /** Folds along width (hinge parallel to length); preview may switch when both axes have folds. */
  bendsAlongWidth?: PanelBendSpec[];
  panelColorHex: string;
  panelColorName: string;
  panelSwatchImage?: string;
}

type BendSpec = {
  positionIn: number;
  angleDeg: number;
};

type BuiltPart = {
  key: string;
  position: [number, number, number];
  rotation: [number, number, number];
  args: [number, number, number];
};

function inchesToWorld(inches: number) {
  return inches * INCH_TO_WORLD;
}

/** Fold along panel length (hinge parallel to width). */
function collectFoldParts(
  widthIn: number,
  heightIn: number,
  thicknessWorld: number,
  bends: BendSpec[]
): BuiltPart[] {
  const width = inchesToWorld(widthIn);
  const thickness = Math.max(thicknessWorld, 0.008);
  const panelSize = heightIn;

  const validBends = [...bends]
    .filter((b) => b.positionIn > MIN_LEG_IN && b.positionIn < panelSize - MIN_LEG_IN)
    .sort((a, b) => a.positionIn - b.positionIn);

  const breakpoints = [0, ...validBends.map((b) => b.positionIn), panelSize];

  let origin = new THREE.Vector3(0, 0, 0);
  let angle = 0;
  const nodes: BuiltPart[] = [];
  let segIdx = 0;

  for (let i = 0; i < breakpoints.length - 1; i++) {
    const lenIn = breakpoints[i + 1] - breakpoints[i];
    if (lenIn <= 1e-6) continue;

    const len = inchesToWorld(lenIn);

    const dir = new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(1, 0, 0), angle);
    const center = origin.clone().add(dir.clone().multiplyScalar(len / 2));
    nodes.push({
      key: `h-${segIdx}`,
      position: [center.x, center.y, center.z],
      rotation: [angle, 0, 0],
      args: [width, len, thickness],
    });
    origin = origin.clone().add(dir.multiplyScalar(len));

    if (i < validBends.length) {
      angle += THREE.MathUtils.degToRad(validBends[i].angleDeg);
    }
    segIdx += 1;
  }

  return nodes;
}

/** Fold along panel width (hinge parallel to length / scene +Y). */
function collectFoldPartsAlongWidth(
  widthIn: number,
  heightIn: number,
  thicknessWorld: number,
  bends: BendSpec[]
): BuiltPart[] {
  const lengthWorld = inchesToWorld(heightIn);
  const thickness = Math.max(thicknessWorld, 0.008);
  const panelSize = widthIn;

  const validBends = [...bends]
    .filter((b) => b.positionIn > MIN_LEG_IN && b.positionIn < panelSize - MIN_LEG_IN)
    .sort((a, b) => a.positionIn - b.positionIn);

  const breakpoints = [0, ...validBends.map((b) => b.positionIn), panelSize];

  let origin = new THREE.Vector3(0, 0, 0);
  let angle = 0;
  const nodes: BuiltPart[] = [];
  let segIdx = 0;

  for (let i = 0; i < breakpoints.length - 1; i++) {
    const lenIn = breakpoints[i + 1] - breakpoints[i];
    if (lenIn <= 1e-6) continue;

    const len = inchesToWorld(lenIn);

    const dir = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    const center = origin.clone().add(dir.clone().multiplyScalar(len / 2));
    nodes.push({
      key: `w-${segIdx}`,
      position: [center.x, center.y, center.z],
      rotation: [0, angle, 0],
      args: [len, lengthWorld, thickness],
    });
    origin = origin.clone().add(dir.multiplyScalar(len));

    if (i < validBends.length) {
      angle += THREE.MathUtils.degToRad(validBends[i].angleDeg);
    }
    segIdx += 1;
  }

  return nodes;
}

function SwatchTexturedMaterial({ mapUrl }: { mapUrl: string }) {
  const tex = useTexture(mapUrl);
  useLayoutEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
  }, [tex]);
  return (
    <meshStandardMaterial color="#ffffff" map={tex} metalness={0.08} roughness={0.55} envMapIntensity={0.85} />
  );
}

function FoldedPanelMesh({
  parts,
  colorHex,
  mapUrl,
}: {
  parts: BuiltPart[];
  colorHex: string;
  mapUrl?: string;
}) {

  return (
    <group>
      {parts.map((p) => (
        <mesh
          key={`${p.key}-${p.args[0].toFixed(5)}-${p.args[1].toFixed(5)}-${p.args[2].toFixed(5)}`}
          position={p.position}
          rotation={p.rotation}
        >
          <boxGeometry args={p.args} />
          {mapUrl ? (
            <Suspense fallback={<meshStandardMaterial color={colorHex} metalness={0.15} roughness={0.75} />}>
              <SwatchTexturedMaterial mapUrl={mapUrl} />
            </Suspense>
          ) : (
            <meshStandardMaterial color={colorHex} metalness={0.15} roughness={0.75} />
          )}
          <Edges color="#555" threshold={12} />
        </mesh>
      ))}
    </group>
  );
}

function PreviewScene({
  parts,
  minSpanInches,
  colorHex,
  mapUrl,
}: {
  parts: BuiltPart[];
  /** Floor for camera distance (typically max(width, length)). */
  minSpanInches: number;
  colorHex: string;
  mapUrl?: string;
}) {
  let maxWorld = inchesToWorld(Math.max(minSpanInches, 12));
  for (const p of parts) {
    const [px, py] = p.position;
    const [ax, ay] = p.args;
    maxWorld = Math.max(maxWorld, Math.abs(px) + ax / 2, Math.abs(py) + ay / 2, Math.abs(p.position[2]) + p.args[2] / 2);
  }
  const camDistance = Math.max(7, maxWorld * 4.2);
  /** Tight zoom band around default framing */
  const zoomMin = camDistance * 0.58;
  const zoomMax = camDistance * 1.02;

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{
        position: [camDistance * 0.92, camDistance * 0.72, camDistance * 0.95],
        fov: 38,
        near: 0.1,
        far: camDistance * 25,
      }}
      style={{ width: "100%", height: "100%", display: "block" }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#f4f5f7"]} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[8, 12, 6]} intensity={1} />

      <Suspense fallback={null}>
        <Center precise>
          <FoldedPanelMesh parts={parts} colorHex={colorHex} mapUrl={mapUrl} />
        </Center>
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan={false}
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.78}
        zoomSpeed={0.65}
        minDistance={zoomMin}
        maxDistance={zoomMax}
        minPolarAngle={0.38 * Math.PI}
        maxPolarAngle={0.58 * Math.PI}
      />
    </Canvas>
  );
}

export function AcmPanel3DPreview({
  panelWidthIn,
  panelHeightIn,
  panelDepthIn,
  bends: bendsProp = [],
  bendsAlongWidth: bendsWidthProp = [],
  panelColorHex,
  panelColorName,
  panelSwatchImage,
}: AcmPanel3DPreviewProps) {
  const bendsLengthNorm = useMemo(
    () => normalizePanelBends(bendsProp, panelHeightIn),
    [bendsProp, panelHeightIn]
  );
  const bendsWidthNorm = useMemo(
    () => normalizePanelBends(bendsWidthProp, panelWidthIn),
    [bendsWidthProp, panelWidthIn]
  );

  const hasLength = bendsLengthNorm.length > 0;
  const hasWidth = bendsWidthNorm.length > 0;
  const both = hasLength && hasWidth;

  const [previewAxis, setPreviewAxis] = useState<"length" | "width">("length");

  const partsLength = useMemo(() => {
    const bends: BendSpec[] = bendsLengthNorm.map((b) => ({
      positionIn: b.inchesFromEdge,
      angleDeg: b.angleDeg,
    }));
    return collectFoldParts(panelWidthIn, panelHeightIn, inchesToWorld(panelDepthIn), bends);
  }, [panelWidthIn, panelHeightIn, panelDepthIn, bendsLengthNorm]);

  const partsWidth = useMemo(() => {
    const bends: BendSpec[] = bendsWidthNorm.map((b) => ({
      positionIn: b.inchesFromEdge,
      angleDeg: b.angleDeg,
    }));
    return collectFoldPartsAlongWidth(panelWidthIn, panelHeightIn, inchesToWorld(panelDepthIn), bends);
  }, [panelWidthIn, panelHeightIn, panelDepthIn, bendsWidthNorm]);

  const activeParts = useMemo(() => {
    if (both) return previewAxis === "length" ? partsLength : partsWidth;
    if (hasLength) return partsLength;
    if (hasWidth) return partsWidth;
    return partsLength;
  }, [both, previewAxis, hasLength, hasWidth, partsLength, partsWidth]);

  const isVisuallyFoldedLength = bendsLengthNorm.some(
    (b) => b.angleDeg > 0.5 && b.angleDeg < 179.5
  );
  const isVisuallyFoldedWidth = bendsWidthNorm.some(
    (b) => b.angleDeg > 0.5 && b.angleDeg < 179.5
  );

  const hex =
    panelColorHex && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(panelColorHex.trim())
      ? panelColorHex.trim()
      : "#c8cdd3";

  const mapUrl =
    panelSwatchImage && panelSwatchImage.length > 0 ? panelSwatchImage : undefined;

  const caption = (() => {
    const size = `${panelWidthIn}" × ${panelHeightIn}"`;
    const bits: string[] = [];
    if (hasLength) {
      if (bendsLengthNorm.length === 1) {
        const b = bendsLengthNorm[0];
        const flatHint = isVisuallyFoldedLength ? "" : " (straight)";
        bits.push(`Length: ${b.inchesFromEdge}" · ${b.angleDeg}°${flatHint}`);
      } else {
        bits.push(
          `Length: ${bendsLengthNorm.length} bends (${bendsLengthNorm.map((b) => `${b.inchesFromEdge}"@${b.angleDeg}°`).join(", ")})`
        );
      }
    }
    if (hasWidth) {
      if (bendsWidthNorm.length === 1) {
        const b = bendsWidthNorm[0];
        const flatHint = isVisuallyFoldedWidth ? "" : " (straight)";
        bits.push(`Width: ${b.inchesFromEdge}" · ${b.angleDeg}°${flatHint}`);
      } else {
        bits.push(
          `Width: ${bendsWidthNorm.length} bends (${bendsWidthNorm.map((b) => `${b.inchesFromEdge}"@${b.angleDeg}°`).join(", ")})`
        );
      }
    }
    if (bits.length === 0) return `${size} · ${panelColorName}`;
    return `${bits.join(" · ")} · ${size} · ${panelColorName}`;
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
        Fold &amp; bend preview
      </h2>
      <p className="mt-0.5 text-xs text-gray-500">
        Folds along <span className="font-medium text-gray-600">length</span> use a hinge parallel to width; folds along{" "}
        <span className="font-medium text-gray-600">width</span> use a hinge parallel to length (local Y). If both are
        set, switch the preview below. Orbit after.
      </p>

      {both ? (
        <div className="mt-2 flex flex-wrap gap-2" role="tablist" aria-label="3D preview axis">
          <button
            type="button"
            role="tab"
            aria-selected={previewAxis === "length"}
            onClick={() => setPreviewAxis("length")}
            className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
              previewAxis === "length"
                ? "bg-gray-900 text-white"
                : "border border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
            }`}
          >
            Preview length-axis folds
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={previewAxis === "width"}
            onClick={() => setPreviewAxis("width")}
            className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
              previewAxis === "width"
                ? "bg-gray-900 text-white"
                : "border border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
            }`}
          >
            Preview width-axis folds
          </button>
        </div>
      ) : null}

      <div
        className="mx-auto mt-3 overflow-hidden rounded-xl border border-gray-100 bg-[#f4f5f7]"
        style={{ height: PREVIEW_H, maxWidth: 520 }}
      >
        <PreviewScene
          parts={activeParts}
          minSpanInches={Math.max(panelWidthIn, panelHeightIn)}
          colorHex={hex}
          mapUrl={mapUrl}
        />
      </div>

      <p className="mt-3 border-t border-gray-100 pt-3 text-center text-[15px] font-medium text-gray-500">
        {caption}
      </p>
      <p className="mt-2 text-center text-xs text-gray-400">
        Drag to orbit around center · scroll for limited zoom
      </p>
    </section>
  );
}
