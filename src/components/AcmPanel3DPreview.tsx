"use client";

import { Suspense, useLayoutEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Center, Edges, Environment, OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { BoxTraySideRow } from "@/types/boxTray";
import { normalizeBoxTraySides } from "@/lib/boxTray";

/** Preview viewport height (px). */
const PREVIEW_H = 360;
/** Same visual scale as prior CSS preview (inches → scene units). */
const INCH_TO_WORLD = 0.05;

/** Lighting tuned so swatches read like the CSS flat preview (diffuse-dominant, not gray IBL). */
const PREVIEW_KEY_LIGHT = "#fff7f2";
const PREVIEW_FILL_LIGHT = "#ffffff";

/** Default orbit direction (same framing as before); distance is fixed at closest zoom. */
const PREVIEW_ORBIT_VIEW_DIR = new THREE.Vector3(0.92, 0.72, 0.95).normalize();

function StickyOrbitCamera({ radius }: { radius: number }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls);
  useLayoutEffect(() => {
    const p = PREVIEW_ORBIT_VIEW_DIR.clone().multiplyScalar(radius);
    camera.position.set(p.x, p.y, p.z);
    camera.updateProjectionMatrix();
    const upd = (controls as { update?: () => void } | null)?.update;
    upd?.();
  }, [radius, camera, controls]);
  return null;
}

export interface AcmPanel3DPreviewProps {
  panelWidthIn: number;
  panelHeightIn: number;
  panelDepthIn: number;
  /** Perimeter flanges hinged off the fixed W×L face (flat blank layout). */
  boxSides?: BoxTraySideRow[];
  panelColorHex: string;
  panelColorName: string;
  panelSwatchImage?: string;
}

type BuiltPart = {
  key: string;
  position: [number, number, number];
  rotation: [number, number, number];
  args: [number, number, number];
};

function inchesToWorld(inches: number) {
  return inches * INCH_TO_WORLD;
}

const EULER_ORDER: "XYZ" = "XYZ";

/**
 * Mesh is centered on its box; `hingeLocal` is the crease point on the flat flange in mesh-local space.
 * After rotation around the origin, that point must coincide with `hingeWorld`.
 */
function partFromHinge(
  key: string,
  hingeWorld: THREE.Vector3,
  hingeLocal: THREE.Vector3,
  euler: THREE.Euler,
  args: [number, number, number]
): BuiltPart {
  const q = new THREE.Quaternion().setFromEuler(euler);
  const pos = hingeWorld.clone().sub(hingeLocal.clone().applyQuaternion(q));
  return {
    key,
    position: [pos.x, pos.y, pos.z],
    rotation: [euler.x, euler.y, euler.z],
    args,
  };
}

function buildBoxTrayParts(
  widthIn: number,
  lengthIn: number,
  thicknessWorld: number,
  sides: BoxTraySideRow[]
): BuiltPart[] {
  const W = inchesToWorld(widthIn);
  const L = inchesToWorld(lengthIn);
  const t = Math.max(thicknessWorld, 0.008);
  const parts: BuiltPart[] = [];

  parts.push({
    key: "base",
    position: [0, L / 2, 0],
    rotation: [0, 0, 0],
    args: [W, L, t],
  });

  for (const side of sides) {
    const H = inchesToWorld(Math.max(side.flangeHeightIn, 0.01));
    const deg = side.angleDeg;
    let p: BuiltPart;

    switch (side.edge) {
      case "south": {
        const rx = THREE.MathUtils.degToRad(deg);
        const e = new THREE.Euler(rx, 0, 0, EULER_ORDER);
        p = partFromHinge(
          side.id,
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, H / 2, 0),
          e,
          [W, H, t]
        );
        break;
      }
      case "north": {
        const rx = -THREE.MathUtils.degToRad(deg);
        const e = new THREE.Euler(rx, 0, 0, EULER_ORDER);
        p = partFromHinge(
          side.id,
          new THREE.Vector3(0, L, 0),
          new THREE.Vector3(0, -H / 2, 0),
          e,
          [W, H, t]
        );
        break;
      }
      case "west": {
        const ry = THREE.MathUtils.degToRad(deg);
        const e = new THREE.Euler(0, ry, 0, EULER_ORDER);
        p = partFromHinge(
          side.id,
          new THREE.Vector3(-W / 2, L / 2, 0),
          new THREE.Vector3(H / 2, 0, 0),
          e,
          [H, L, t]
        );
        break;
      }
      case "east": {
        const ry = -THREE.MathUtils.degToRad(deg);
        const e = new THREE.Euler(0, ry, 0, EULER_ORDER);
        p = partFromHinge(
          side.id,
          new THREE.Vector3(W / 2, L / 2, 0),
          new THREE.Vector3(-H / 2, 0, 0),
          e,
          [H, L, t]
        );
        break;
      }
      default:
        continue;
    }
    parts.push(p);
  }

  return parts;
}

function SwatchTexturedMaterial({ mapUrl }: { mapUrl: string }) {
  const tex = useTexture(mapUrl);
  useLayoutEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
  }, [tex]);
  return (
    <meshStandardMaterial
      color="#ffffff"
      map={tex}
      metalness={0}
      roughness={0.82}
      envMapIntensity={0.42}
    />
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
          key={`${p.key}-${p.args[0].toFixed(5)}-${p.args[1].toFixed(5)}-${p.args[2].toFixed(5)}-${p.rotation[0].toFixed(4)}-${p.rotation[1].toFixed(4)}-${p.rotation[2].toFixed(4)}`}
          position={p.position}
          rotation={p.rotation}
          castShadow={false}
          receiveShadow={false}
        >
          <boxGeometry args={p.args} />
          {mapUrl ? (
            <Suspense fallback={<meshStandardMaterial color={colorHex} metalness={0} roughness={0.82} envMapIntensity={0.42} />}>
              <SwatchTexturedMaterial mapUrl={mapUrl} />
            </Suspense>
          ) : (
            <meshStandardMaterial color={colorHex} metalness={0} roughness={0.82} envMapIntensity={0.42} />
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
  /** Closest orbit distance — preview stays here (no zoom). */
  const orbitRadius = camDistance * 0.58;
  const p0 = PREVIEW_ORBIT_VIEW_DIR.clone().multiplyScalar(orbitRadius);
  const cameraPosition: [number, number, number] = [p0.x, p0.y, p0.z];

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{
        position: cameraPosition,
        fov: 38,
        near: 0.1,
        far: camDistance * 25,
      }}
      shadows={false}
      style={{ width: "100%", height: "100%", display: "block" }}
      gl={{
        antialias: true,
        toneMapping: THREE.NeutralToneMapping,
        toneMappingExposure: 1.08,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
    >
      <StickyOrbitCamera radius={orbitRadius} />
      <color attach="background" args={["#f4f5f7"]} />
      <hemisphereLight color="#ffffff" groundColor="#ebe6e1" intensity={0.48} />
      <ambientLight intensity={0.32} color="#fefefe" />
      <directionalLight castShadow={false} color={PREVIEW_KEY_LIGHT} position={[6, 11, 8]} intensity={1.38} />
      <directionalLight castShadow={false} color={PREVIEW_FILL_LIGHT} position={[-6, 5, 6]} intensity={0.62} />

      <Suspense fallback={null}>
        <Environment preset="apartment" environmentIntensity={0.5} />
        <Center precise>
          <FoldedPanelMesh parts={parts} colorHex={colorHex} mapUrl={mapUrl} />
        </Center>
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.78}
        minDistance={orbitRadius}
        maxDistance={orbitRadius}
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
  boxSides: boxSidesProp = [],
  panelColorHex,
  panelColorName,
  panelSwatchImage,
}: AcmPanel3DPreviewProps) {
  const sidesNorm = useMemo(() => normalizeBoxTraySides(boxSidesProp), [boxSidesProp]);

  const activeParts = useMemo(
    () => buildBoxTrayParts(panelWidthIn, panelHeightIn, inchesToWorld(panelDepthIn), sidesNorm),
    [panelWidthIn, panelHeightIn, panelDepthIn, sidesNorm]
  );

  const hex =
    panelColorHex && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(panelColorHex.trim())
      ? panelColorHex.trim()
      : "#c8cdd3";

  const mapUrl =
    panelSwatchImage && panelSwatchImage.length > 0 ? panelSwatchImage : undefined;

  const edgeShort: Record<string, string> = {
    south: "front",
    north: "back",
    west: "left",
    east: "right",
  };

  const caption = (() => {
    const size = `${panelWidthIn}" × ${panelHeightIn}"`;
    if (sidesNorm.length === 0) return `${size} flat · ${panelColorName}`;
    const bits = sidesNorm.map(
      (s) => `${edgeShort[s.edge] ?? s.edge} ${s.flangeHeightIn}" @ ${s.angleDeg}°`
    );
    return `${size} tray · ${bits.join(" · ")} · ${panelColorName}`;
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
        Center face is always width × length. Add sides (returns) on each edge of the blank; each side has its own height
        in inches and bend angle. Positive° tips that flange toward +Z (outward in the default view); negative° tips
        inward. Orbit below.
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
        Drag to rotate the view (zoom is fixed).
      </p>
    </section>
  );
}
