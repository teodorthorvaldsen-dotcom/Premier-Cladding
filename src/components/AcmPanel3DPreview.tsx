"use client";

import { Suspense, useLayoutEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Billboard, Edges, Environment, Line, OrbitControls, Text, useTexture } from "@react-three/drei";
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
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    const ctl = controls as { target?: THREE.Vector3; update?: () => void } | null | undefined;
    if (ctl?.target) {
      ctl.target.set(0, 0, 0);
    }
    ctl?.update?.();
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
  /** Correlates with configurator list: "Flat center" for base, "Side N" for returns. */
  label: string;
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
  args: [number, number, number],
  label: string
): BuiltPart {
  const q = new THREE.Quaternion().setFromEuler(euler);
  const pos = hingeWorld.clone().sub(hingeLocal.clone().applyQuaternion(q));
  return {
    key,
    position: [pos.x, pos.y, pos.z],
    rotation: [euler.x, euler.y, euler.z],
    args,
    label,
  };
}

/** AABB center + bounding-sphere radius (max corner distance from center) for all mesh parts. */
function meshBoundsFromParts(parts: BuiltPart[]): {
  center: THREE.Vector3;
  boundingSphereRadius: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  const euler = new THREE.Euler(0, 0, 0, EULER_ORDER);
  const quat = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  const corner = new THREE.Vector3();

  for (const p of parts) {
    euler.set(p.rotation[0], p.rotation[1], p.rotation[2], EULER_ORDER);
    quat.setFromEuler(euler);
    pos.set(p.position[0], p.position[1], p.position[2]);
    const hx = p.args[0] / 2;
    const hy = p.args[1] / 2;
    const hz = p.args[2] / 2;
    for (let i = 0; i < 8; i++) {
      const sx = i & 1 ? hx : -hx;
      const sy = i & 2 ? hy : -hy;
      const sz = i & 4 ? hz : -hz;
      corner.set(sx, sy, sz).applyQuaternion(quat).add(pos);
      minX = Math.min(minX, corner.x);
      minY = Math.min(minY, corner.y);
      minZ = Math.min(minZ, corner.z);
      maxX = Math.max(maxX, corner.x);
      maxY = Math.max(maxY, corner.y);
      maxZ = Math.max(maxZ, corner.z);
    }
  }

  if (!Number.isFinite(minX)) {
    return { center: new THREE.Vector3(0, 0, 0), boundingSphereRadius: inchesToWorld(12) };
  }
  const center = new THREE.Vector3((minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2);
  let boundingSphereRadius = 0;
  for (const p of parts) {
    euler.set(p.rotation[0], p.rotation[1], p.rotation[2], EULER_ORDER);
    quat.setFromEuler(euler);
    pos.set(p.position[0], p.position[1], p.position[2]);
    const hx = p.args[0] / 2;
    const hy = p.args[1] / 2;
    const hz = p.args[2] / 2;
    for (let i = 0; i < 8; i++) {
      const sx = i & 1 ? hx : -hx;
      const sy = i & 2 ? hy : -hy;
      const sz = i & 4 ? hz : -hz;
      corner.set(sx, sy, sz).applyQuaternion(quat).add(pos);
      boundingSphereRadius = Math.max(boundingSphereRadius, center.distanceTo(corner));
    }
  }
  return { center, boundingSphereRadius };
}

const PREVIEW_VFOV = 38;

/**
 * Camera distance so the assembly (plus callout margin) stays in frame at any rotation (sphere fit).
 * No large minimum distance — small panels stay zoomed-in and centered.
 */
function computePreviewOrbitRadius(
  meshSphereRadius: number,
  minSpanInches: number,
  aspect: number
): number {
  const floorR = inchesToWorld(Math.max(minSpanInches, 8) * 0.25);
  const meshR = Math.max(meshSphereRadius, floorR, 0.06);
  /** Leader lines / billboards sit outside mesh AABB */
  const fitR = meshR * 1.52 + inchesToWorld(3.5);
  const vFov = THREE.MathUtils.degToRad(PREVIEW_VFOV);
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * Math.max(aspect, 0.25));
  const distV = fitR / Math.sin(vFov / 2);
  const distH = fitR / Math.sin(hFov / 2);
  return Math.max(distV, distH, 0.12);
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
    label: "Flat center",
  });

  /** Flat-layout stacking along each edge when multiple rows share the same edge (world units). */
  let stackSouth = 0;
  let stackNorth = 0;
  let stackWest = 0;
  let stackEast = 0;

  for (let i = 0; i < sides.length; i++) {
    const side = sides[i];
    const H = inchesToWorld(Math.max(side.flangeHeightIn, 0.01));
    const deg = side.angleDeg;
    const rowLabel = `Side ${i + 1}`;
    let p: BuiltPart;

    switch (side.edge) {
      case "south": {
        const rx = THREE.MathUtils.degToRad(deg);
        const e = new THREE.Euler(rx, 0, 0, EULER_ORDER);
        const hingeY = -stackSouth;
        p = partFromHinge(
          side.id,
          new THREE.Vector3(0, hingeY, 0),
          new THREE.Vector3(0, H / 2, 0),
          e,
          [W, H, t],
          rowLabel
        );
        stackSouth += H;
        break;
      }
      case "north": {
        const rx = -THREE.MathUtils.degToRad(deg);
        const e = new THREE.Euler(rx, 0, 0, EULER_ORDER);
        const hingeY = L + stackNorth;
        p = partFromHinge(
          side.id,
          new THREE.Vector3(0, hingeY, 0),
          new THREE.Vector3(0, -H / 2, 0),
          e,
          [W, H, t],
          rowLabel
        );
        stackNorth += H;
        break;
      }
      case "west": {
        /** Invert vs former math so +90° matches front/back “inward” convention; −90° tips the other way. */
        const ry = -THREE.MathUtils.degToRad(deg);
        const e = new THREE.Euler(0, ry, 0, EULER_ORDER);
        const hingeX = -W / 2 - stackWest;
        p = partFromHinge(
          side.id,
          new THREE.Vector3(hingeX, L / 2, 0),
          new THREE.Vector3(H / 2, 0, 0),
          e,
          [H, L, t],
          rowLabel
        );
        stackWest += H;
        break;
      }
      case "east": {
        const ry = THREE.MathUtils.degToRad(deg);
        const e = new THREE.Euler(0, ry, 0, EULER_ORDER);
        const hingeX = W / 2 + stackEast;
        p = partFromHinge(
          side.id,
          new THREE.Vector3(hingeX, L / 2, 0),
          new THREE.Vector3(-H / 2, 0, 0),
          e,
          [H, L, t],
          rowLabel
        );
        stackEast += H;
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

/** Leader line from part center outward; label sits past the line so it stays off the sheet metal. */
function PartRadialCallout({
  part,
  partIdx,
  partsCount,
}: {
  part: BuiltPart;
  partIdx: number;
  partsCount: number;
}) {
  const layout = useMemo(() => {
    const pos = new THREE.Vector3(...part.position);
    const extent = Math.max(part.args[0], part.args[1], part.args[2]);
    const fontSize = THREE.MathUtils.clamp(extent * 0.1, 0.13, 0.42);

    /** Main face: lead from middle of broad face along +Z (not +Y), so “back” edge callouts aren’t stacked far above. */
    if (part.key === "base") {
      const t = part.args[2];
      const dir = new THREE.Vector3(0, 0, 1);
      const surfaceZ = t / 2 + 0.02;
      const outward = extent * 0.38;
      const start = pos.clone().add(new THREE.Vector3(0, 0, surfaceZ));
      const end = pos.clone().add(new THREE.Vector3(0, 0, surfaceZ + outward));
      const textPos = end.clone().addScaledVector(dir, fontSize * 0.65);
      return {
        linePoints: [start, end] as [THREE.Vector3, THREE.Vector3],
        textPos: [textPos.x, textPos.y, textPos.z] as [number, number, number],
        fontSize,
        span: extent,
      };
    }

    const dir = pos.lengthSq() < 1e-10 ? new THREE.Vector3(0, 1, 0) : pos.clone().normalize();
    const fanRaw = (partIdx - (partsCount - 1) / 2) * 0.05;
    const perp = new THREE.Vector3(-dir.y, dir.x, 0);
    if (perp.lengthSq() < 1e-10) perp.set(1, 0, 0);
    perp.multiplyScalar(fanRaw);
    const inner = extent * 0.2;
    const outer = extent * 0.55;
    const start = pos.clone().addScaledVector(dir, inner).add(perp);
    const end = pos.clone().addScaledVector(dir, outer).add(perp);
    const textPos = end.clone().addScaledVector(dir, fontSize * 0.65);
    return {
      linePoints: [start, end] as [THREE.Vector3, THREE.Vector3],
      textPos: [textPos.x, textPos.y, textPos.z] as [number, number, number],
      fontSize,
      span: extent,
    };
  }, [
    part.key,
    part.position[0],
    part.position[1],
    part.position[2],
    part.args[0],
    part.args[1],
    part.args[2],
    partIdx,
    partsCount,
  ]);

  return (
    <group>
      <Line points={layout.linePoints} color="#4b5563" lineWidth={2} opacity={0.92} transparent />
      <Billboard position={layout.textPos} follow={true}>
        <Text
          fontSize={layout.fontSize}
          color="#111827"
          outlineWidth={layout.fontSize * 0.14}
          outlineColor="#f9fafb"
          anchorX="center"
          anchorY="middle"
          maxWidth={layout.span * 2.4}
        >
          {part.label}
        </Text>
      </Billboard>
    </group>
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
  const n = parts.length;
  return (
    <group>
      {parts.map((p, partIdx) => (
        <group
          key={`${partIdx}-${p.key}-${p.args[0].toFixed(5)}-${p.args[1].toFixed(5)}-${p.args[2].toFixed(5)}-${p.rotation[0].toFixed(4)}-${p.rotation[1].toFixed(4)}-${p.rotation[2].toFixed(4)}`}
        >
          <group position={p.position} rotation={p.rotation}>
            <mesh castShadow={false} receiveShadow={false}>
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
          </group>
          <Suspense fallback={null}>
            <PartRadialCallout part={p} partIdx={partIdx} partsCount={n} />
          </Suspense>
        </group>
      ))}
    </group>
  );
}

const PREVIEW_ASPECT_FALLBACK = 520 / PREVIEW_H;

/** Centers mesh at origin every time `parts` change (no async Center helper); camera always looks at (0,0,0). */
function PreviewRig({
  parts,
  minSpanInches,
  colorHex,
  mapUrl,
}: {
  parts: BuiltPart[];
  minSpanInches: number;
  colorHex: string;
  mapUrl?: string;
}) {
  const { camera, size } = useThree();
  const { center, boundingSphereRadius } = useMemo(() => meshBoundsFromParts(parts), [parts]);
  const orbitRadius = useMemo(() => {
    const w = size.width > 2 ? size.width : PREVIEW_ASPECT_FALLBACK * PREVIEW_H;
    const h = size.height > 2 ? size.height : PREVIEW_H;
    const aspect = w / Math.max(h, 1);
    return computePreviewOrbitRadius(boundingSphereRadius, minSpanInches, aspect);
  }, [boundingSphereRadius, minSpanInches, size.width, size.height]);

  useLayoutEffect(() => {
    camera.near = Math.max(0.01, orbitRadius / 2000);
    camera.far = orbitRadius * 80 + 20;
    camera.updateProjectionMatrix();
  }, [camera, orbitRadius]);

  return (
    <>
      <StickyOrbitCamera radius={orbitRadius} />
      <Suspense fallback={null}>
        <Environment preset="apartment" environmentIntensity={0.5} />
        <group position={[-center.x, -center.y, -center.z]}>
          <FoldedPanelMesh parts={parts} colorHex={colorHex} mapUrl={mapUrl} />
        </group>
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
        minPolarAngle={0.3 * Math.PI}
        maxPolarAngle={0.7 * Math.PI}
      />
    </>
  );
}

function PreviewScene({
  parts,
  minSpanInches,
  colorHex,
  mapUrl,
}: {
  parts: BuiltPart[];
  minSpanInches: number;
  colorHex: string;
  mapUrl?: string;
}) {
  const p0 = PREVIEW_ORBIT_VIEW_DIR.clone().multiplyScalar(2.5);
  const cameraPosition: [number, number, number] = [p0.x, p0.y, p0.z];

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{
        position: cameraPosition,
        fov: PREVIEW_VFOV,
        near: 0.1,
        far: 200,
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
      <color attach="background" args={["#f4f5f7"]} />
      <hemisphereLight color="#ffffff" groundColor="#ebe6e1" intensity={0.48} />
      <ambientLight intensity={0.32} color="#fefefe" />
      <directionalLight castShadow={false} color={PREVIEW_KEY_LIGHT} position={[6, 11, 8]} intensity={1.38} />
      <directionalLight castShadow={false} color={PREVIEW_FILL_LIGHT} position={[-6, 5, 6]} intensity={0.62} />

      <PreviewRig parts={parts} minSpanInches={minSpanInches} colorHex={colorHex} mapUrl={mapUrl} />
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
        Center face is always width × length. <span className="font-medium text-gray-700">Flat center</span> and{" "}
        <span className="font-medium text-gray-700">Side 1, Side 2, …</span> sit beside the model with leader lines pointing in. The same
        edge may repeat (stacked flanges). On front/back, positive° tips outward (+Z in this view) and negative° inward. Left/right
        use the same sign convention for matching bends. Drag to rotate.
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
