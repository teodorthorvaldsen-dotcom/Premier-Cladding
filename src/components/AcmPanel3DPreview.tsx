"use client";

import { Suspense, useLayoutEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Center, Edges, OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";

const PREVIEW_H = 360;
/** Same visual scale as prior CSS preview (inches → scene units). */
const INCH_TO_WORLD = 0.05;
const MIN_LEG_IN = 0.5;

export interface AcmPanel3DPreviewProps {
  panelWidthIn: number;
  panelHeightIn: number;
  panelDepthIn: number;
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
  foldPositionIn,
  foldAngleDeg,
  isFolded,
  colorHex,
  mapUrl,
}: {
  widthIn: number;
  heightIn: number;
  thicknessWorld: number;
  /** Inches from edge to fold along length; ignored when not folded. */
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
    return collectFoldParts(widthIn, heightIn, thicknessWorld, bends);
  }, [widthIn, heightIn, thicknessWorld, isFolded, foldPositionIn, foldAngleDeg]);

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
  widthIn,
  heightIn,
  thicknessWorld,
  foldPositionIn,
  foldAngleDeg,
  isFolded,
  colorHex,
  mapUrl,
}: {
  widthIn: number;
  heightIn: number;
  thicknessWorld: number;
  foldPositionIn: number;
  foldAngleDeg: number;
  isFolded: boolean;
  colorHex: string;
  mapUrl?: string;
}) {
  const maxWorld = inchesToWorld(Math.max(widthIn, heightIn, 12));
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
          <FoldedPanelMesh
            widthIn={widthIn}
            heightIn={heightIn}
            thicknessWorld={thicknessWorld}
            foldPositionIn={foldPositionIn}
            foldAngleDeg={foldAngleDeg}
            isFolded={isFolded}
            colorHex={colorHex}
            mapUrl={mapUrl}
          />
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
  bendAngleDeg = 0,
  bendInchesFromEdge,
  panelColorHex,
  panelColorName,
  panelSwatchImage,
}: AcmPanel3DPreviewProps) {
  const isBent = bendAngleDeg > 0.5 && bendAngleDeg < 179.5;

  const foldPos = clampFoldPosition(
    bendInchesFromEdge ?? panelHeightIn / 2,
    panelHeightIn
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
      return `L-bend ${bendAngleDeg}° · fold ${foldPos}" from edge (along length) · ${size} · ${panelColorName}`;
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
        Drag to orbit around center · scroll for limited zoom
      </p>
    </section>
  );
}
