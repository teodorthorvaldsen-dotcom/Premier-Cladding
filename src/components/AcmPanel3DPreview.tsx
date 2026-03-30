"use client";

import { Suspense, useLayoutEffect, useMemo } from "react";
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
  /** Folds along width (hinge parallel to length). Combined with length folds in one preview when both set. */
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
    const midAlong = dir.clone().multiplyScalar(len / 2);
    /** Match length-axis convention: panel spans y ∈ [0, lengthWorld] at z = 0 mid-plane. */
    const midLength = new THREE.Vector3(0, lengthWorld / 2, 0);
    const center = origin.clone().add(midAlong).add(midLength);
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

/**
 * When both axes have folds: apply length-axis strips first, then width-axis splits within each strip’s local frame
 * (hinge parallel to strip length / +Y).
 */
function composeLengthAndWidthParts(
  widthIn: number,
  heightIn: number,
  thicknessWorld: number,
  lengthSpecs: BendSpec[],
  widthSpecs: BendSpec[]
): BuiltPart[] {
  if (widthSpecs.length === 0) {
    return collectFoldParts(widthIn, heightIn, thicknessWorld, lengthSpecs);
  }
  if (lengthSpecs.length === 0) {
    return collectFoldPartsAlongWidth(widthIn, heightIn, thicknessWorld, widthSpecs);
  }

  const lengthParts = collectFoldParts(widthIn, heightIn, thicknessWorld, lengthSpecs);
  const out: BuiltPart[] = [];
  let idx = 0;
  const eulerOrder: "XYZ" = "XYZ";

  for (const lp of lengthParts) {
    const W = lp.args[0];
    const L = lp.args[1];
    const t = lp.args[2];
    const W_in = W / INCH_TO_WORLD;
    const L_in = L / INCH_TO_WORLD;

    const subParts = collectFoldPartsAlongWidth(W_in, L_in, thicknessWorld, widthSpecs);

    const parentEuler = new THREE.Euler(lp.rotation[0], lp.rotation[1], lp.rotation[2], eulerOrder);
    const parentQuat = new THREE.Quaternion().setFromEuler(parentEuler);
    const parentCenter = new THREE.Vector3(...lp.position);

    const localBottomLeft = new THREE.Vector3(-W / 2, -L / 2, 0);
    const cornerWorld = parentCenter.clone().add(localBottomLeft.clone().applyQuaternion(parentQuat));

    for (const sp of subParts) {
      const offset = new THREE.Vector3(sp.position[0], sp.position[1], sp.position[2]);
      const worldPos = cornerWorld.clone().add(offset.clone().applyQuaternion(parentQuat));

      const subEuler = new THREE.Euler(sp.rotation[0], sp.rotation[1], sp.rotation[2], eulerOrder);
      const subQuat = new THREE.Quaternion().setFromEuler(subEuler);
      const worldQuat = parentQuat.clone().multiply(subQuat);
      const worldEuler = new THREE.Euler().setFromQuaternion(worldQuat, eulerOrder);

      out.push({
        key: `lw-${idx}`,
        position: [worldPos.x, worldPos.y, worldPos.z],
        rotation: [worldEuler.x, worldEuler.y, worldEuler.z],
        args: sp.args,
      });
      idx += 1;
    }
  }

  return out;
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
          castShadow={false}
          receiveShadow={false}
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
      shadows={false}
      style={{ width: "100%", height: "100%", display: "block" }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#f4f5f7"]} />
      <ambientLight intensity={0.92} />
      <directionalLight castShadow={false} position={[8, 12, 6]} intensity={0.72} />

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

  const activeParts = useMemo(() => {
    const lenSpecs: BendSpec[] = bendsLengthNorm.map((b) => ({
      positionIn: b.inchesFromEdge,
      angleDeg: b.angleDeg,
    }));
    const widSpecs: BendSpec[] = bendsWidthNorm.map((b) => ({
      positionIn: b.inchesFromEdge,
      angleDeg: b.angleDeg,
    }));
    const t = inchesToWorld(panelDepthIn);
    return composeLengthAndWidthParts(panelWidthIn, panelHeightIn, t, lenSpecs, widSpecs);
  }, [panelWidthIn, panelHeightIn, panelDepthIn, bendsLengthNorm, bendsWidthNorm]);

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
        <span className="font-medium text-gray-600">width</span> use a hinge parallel to length. When both are set, the
        preview combines them (length strips first, then width splits in each strip). Orbit below.
      </p>

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
