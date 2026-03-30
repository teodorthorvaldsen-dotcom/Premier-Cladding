"use client";

import { Suspense, useLayoutEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Center, Edges, OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";

const PREVIEW_H = 360;
/** Same visual scale as prior CSS preview (inches → scene units). */
const INCH_TO_WORLD = 0.05;
const MIN_LEG_IN = 0.5;

export type PanelBendAxis = "x" | "y";

export interface AcmPanel3DPreviewProps {
  panelWidthIn: number;
  panelHeightIn: number;
  panelDepthIn: number;
  bendAxis?: PanelBendAxis;
  bendAngleDeg?: number;
  bendInchesFromEdge?: number;
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

function clampFoldPosition(positionIn: number, panelSizeIn: number) {
  const hi = Math.max(MIN_LEG_IN, panelSizeIn - MIN_LEG_IN);
  if (hi <= MIN_LEG_IN) return panelSizeIn / 2;
  return Math.min(hi, Math.max(MIN_LEG_IN, positionIn));
}

function collectFoldParts(
  axis: "horizontal" | "vertical",
  widthIn: number,
  heightIn: number,
  thicknessWorld: number,
  bends: BendSpec[]
): BuiltPart[] {
  const width = inchesToWorld(widthIn);
  const height = inchesToWorld(heightIn);
  const thickness = Math.max(thicknessWorld, 0.008);

  const panelSize = axis === "horizontal" ? heightIn : widthIn;

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

    if (axis === "horizontal") {
      const dir = new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(1, 0, 0), angle);
      const center = origin.clone().add(dir.clone().multiplyScalar(len / 2));
      nodes.push({
        key: `h-${segIdx}`,
        position: [center.x, center.y, center.z],
        rotation: [angle, 0, 0],
        args: [width, len, thickness],
      });
      origin = origin.clone().add(dir.multiplyScalar(len));
    } else {
      const dir = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), angle);
      const center = origin.clone().add(dir.clone().multiplyScalar(len / 2));
      nodes.push({
        key: `v-${segIdx}`,
        position: [center.x, center.y, center.z],
        rotation: [0, 0, angle],
        args: [len, height, thickness],
      });
      origin = origin.clone().add(dir.multiplyScalar(len));
    }

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
  widthIn,
  heightIn,
  thicknessWorld,
  axis,
  foldPositionIn,
  foldAngleDeg,
  isFolded,
  colorHex,
  mapUrl,
}: {
  widthIn: number;
  heightIn: number;
  thicknessWorld: number;
  axis: "horizontal" | "vertical";
  /** Inches from edge to fold along split dimension; ignored when not folded. */
  foldPositionIn: number;
  foldAngleDeg: number;
  isFolded: boolean;
  colorHex: string;
  mapUrl?: string;
}) {
  const parts = useMemo(() => {
    const bends: BendSpec[] = isFolded
      ? [{ positionIn: foldPositionIn, angleDeg: foldAngleDeg }]
      : [];
    return collectFoldParts(axis, widthIn, heightIn, thicknessWorld, bends);
  }, [
    axis,
    widthIn,
    heightIn,
    thicknessWorld,
    isFolded,
    foldPositionIn,
    foldAngleDeg,
  ]);

  return (
    <group>
      {parts.map((p) => (
        <mesh
          key={`${p.key}-${p.args[0].toFixed(5)}-${p.args[1].toFixed(5)}-${p.args[2].toFixed(5)}`}
          position={p.position}
          rotation={p.rotation}
          castShadow
          receiveShadow
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
  widthIn,
  heightIn,
  thicknessWorld,
  axis,
  foldPositionIn,
  foldAngleDeg,
  isFolded,
  colorHex,
  mapUrl,
}: {
  widthIn: number;
  heightIn: number;
  thicknessWorld: number;
  axis: "horizontal" | "vertical";
  foldPositionIn: number;
  foldAngleDeg: number;
  isFolded: boolean;
  colorHex: string;
  mapUrl?: string;
}) {
  const maxWorld = inchesToWorld(Math.max(widthIn, heightIn, 12));
  const camDistance = Math.max(7, maxWorld * 4.2);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [camDistance, camDistance * 0.75, camDistance * 1.05], fov: 38 }}
      style={{ width: "100%", height: "100%", display: "block" }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#f4f5f7"]} />
      <ambientLight intensity={0.72} />
      <directionalLight castShadow position={[10, 14, 8]} intensity={1.15} shadow-mapSize={[2048, 2048]} />

      <Suspense fallback={null}>
        <Center>
          <FoldedPanelMesh
            widthIn={widthIn}
            heightIn={heightIn}
            thicknessWorld={thicknessWorld}
            axis={axis}
            foldPositionIn={foldPositionIn}
            foldAngleDeg={foldAngleDeg}
            isFolded={isFolded}
            colorHex={colorHex}
            mapUrl={mapUrl}
          />
        </Center>
      </Suspense>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -maxWorld * 1.8, 0]} receiveShadow>
        <planeGeometry args={[maxWorld * 14, maxWorld * 14]} />
        <shadowMaterial opacity={0.22} />
      </mesh>

      <OrbitControls enablePan={false} minDistance={camDistance * 0.35} maxDistance={camDistance * 2.2} />
    </Canvas>
  );
}

export function AcmPanel3DPreview({
  panelWidthIn,
  panelHeightIn,
  panelDepthIn,
  bendAxis = "x",
  bendAngleDeg = 0,
  bendInchesFromEdge,
  panelColorHex,
  panelColorName,
  panelSwatchImage,
}: AcmPanel3DPreviewProps) {
  const r3fAxis: "horizontal" | "vertical" = bendAxis === "x" ? "horizontal" : "vertical";
  const splitSize = bendAxis === "x" ? panelHeightIn : panelWidthIn;
  const isBent = bendAngleDeg > 0.5 && bendAngleDeg < 179.5;

  const foldPos = clampFoldPosition(
    bendInchesFromEdge ?? splitSize / 2,
    splitSize
  );

  const thicknessWorld = inchesToWorld(panelDepthIn);

  const hex =
    panelColorHex && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(panelColorHex.trim())
      ? panelColorHex.trim()
      : "#c8cdd3";

  const mapUrl =
    panelSwatchImage && panelSwatchImage.length > 0 ? panelSwatchImage : undefined;

  const caption = (() => {
    const size = `${panelWidthIn}" × ${panelHeightIn}"`;
    if (isBent) {
      return `L-bend ${bendAngleDeg}° · fold ${foldPos}" from edge · axis ${bendAxis.toUpperCase()} · ${size} · ${panelColorName}`;
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
        Fold &amp; bend preview
      </h2>
      <p className="mt-0.5 text-xs text-gray-500">
        Interactive 3D when angle is between 0° and 180°. Orbit below.
      </p>

      <div
        className="mx-auto mt-3 overflow-hidden rounded-xl border border-gray-100 bg-[#f4f5f7]"
        style={{ height: PREVIEW_H, maxWidth: 520 }}
      >
        <PreviewScene
          widthIn={panelWidthIn}
          heightIn={panelHeightIn}
          thicknessWorld={thicknessWorld}
          axis={r3fAxis}
          foldPositionIn={foldPos}
          foldAngleDeg={bendAngleDeg}
          isFolded={isBent}
          colorHex={hex}
          mapUrl={mapUrl}
        />
      </div>

      <p className="mt-3 border-t border-gray-100 pt-3 text-center text-[15px] font-medium text-gray-500">
        {caption}
      </p>
      <p className="mt-2 text-center text-xs text-gray-400">
        Drag to rotate · scroll to zoom
      </p>
    </section>
  );
}
