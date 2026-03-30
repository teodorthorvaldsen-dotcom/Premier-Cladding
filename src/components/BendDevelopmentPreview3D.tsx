"use client";

import * as THREE from "three";
import React, { Suspense, useLayoutEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { bendAllowanceInches } from "@/lib/sheetMetalBend";

const INCH_TO_WORLD = 0.085;

export type BendDevelopmentPreview3DProps = {
  insideRadiusIn: number;
  thicknessIn: number;
  leftLegIn: number;
  rightLegIn: number;
  stripWidthIn: number;
  bendAngleDeg: number;
  kFactor: number;
  bendZoneHex?: string;
  baseHex?: string;
};

/** 90° annular sector in XY (inner r, outer R); extruded along Z then rotated for Y-up scene. */
function bendSectorShape(ri: number, ro: number) {
  const s = new THREE.Shape();
  s.moveTo(ri, 0);
  s.absarc(0, 0, ri, 0, Math.PI / 2, false);
  s.lineTo(0, ro);
  s.absarc(0, 0, ro, Math.PI / 2, 0, true);
  s.closePath();
  return s;
}

function BentStrip90({
  insideRadiusIn,
  thicknessIn,
  leftLegIn,
  rightLegIn,
  stripWidthIn,
  baseHex = "#9ca3af",
}: Omit<BendDevelopmentPreview3DProps, "bendAngleDeg" | "kFactor">) {
  const { bendMesh, leftBox, rightBox, mat } = useMemo(() => {
    const Ri = Math.max(0.001, insideRadiusIn) * INCH_TO_WORLD;
    const T = Math.max(0.001, thicknessIn) * INCH_TO_WORLD;
    const Ro = Ri + T;
    const L1 = Math.max(0, leftLegIn) * INCH_TO_WORLD;
    const L2 = Math.max(0, rightLegIn) * INCH_TO_WORLD;
    const W = Math.max(0.02, stripWidthIn) * INCH_TO_WORLD;

    const shape = bendSectorShape(Ri, Ro);
    const extrude = new THREE.ExtrudeGeometry(shape, {
      depth: W,
      bevelEnabled: false,
      curveSegments: 32,
    });
    extrude.rotateX(-Math.PI / 2);
    extrude.translate(0, W / 2, 0);

    const leftGeom = new THREE.BoxGeometry(L1, T, W);
    leftGeom.translate(-L1 / 2 - Ri, 0, 0);

    const rightGeom = new THREE.BoxGeometry(L2, T, W);
    rightGeom.translate(0, 0, Ri + T / 2 + L2 / 2);

    const matSolid = new THREE.MeshStandardMaterial({
      color: baseHex,
      metalness: 0.12,
      roughness: 0.65,
      side: THREE.DoubleSide,
    });

    return {
      bendMesh: extrude,
      leftBox: leftGeom,
      rightBox: rightGeom,
      mat: matSolid,
    };
  }, [insideRadiusIn, thicknessIn, leftLegIn, rightLegIn, stripWidthIn, baseHex]);

  useLayoutEffect(() => () => {
    bendMesh.dispose();
    leftBox.dispose();
    rightBox.dispose();
    mat.dispose();
  }, [bendMesh, leftBox, rightBox, mat]);

  return (
    <group rotation={[0.25, 0.55, 0]}>
      <mesh castShadow geometry={bendMesh} material={mat} />
      <mesh castShadow geometry={leftBox} material={mat} />
      <mesh castShadow geometry={rightBox} material={mat} />
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, 0]}>
        <planeGeometry args={[4, 4]} />
        <shadowMaterial opacity={0.15} />
      </mesh>
    </group>
  );
}

function FlatStrip({
  leftLegIn,
  bendAllowanceIn,
  rightLegIn,
  stripWidthIn,
  thicknessIn,
  baseHex = "#9ca3af",
  bendZoneHex = "#f59e0b",
}: {
  leftLegIn: number;
  bendAllowanceIn: number;
  rightLegIn: number;
  stripWidthIn: number;
  thicknessIn: number;
  baseHex?: string;
  bendZoneHex?: string;
}) {
  const T = Math.max(0.001, thicknessIn) * INCH_TO_WORLD;
  const W = Math.max(0.02, stripWidthIn) * INCH_TO_WORLD;
  const L1 = Math.max(0, leftLegIn) * INCH_TO_WORLD;
  const BA = Math.max(0.001, bendAllowanceIn) * INCH_TO_WORLD;
  const L2 = Math.max(0, rightLegIn) * INCH_TO_WORLD;
  const total = L1 + BA + L2;
  const x0 = -total / 2;

  const baseMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: baseHex,
        metalness: 0.1,
        roughness: 0.68,
      }),
    [baseHex]
  );
  const zoneMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: bendZoneHex,
        metalness: 0.08,
        roughness: 0.55,
      }),
    [bendZoneHex]
  );

  useLayoutEffect(
    () => () => {
      baseMat.dispose();
      zoneMat.dispose();
    },
    [baseMat, zoneMat]
  );

  return (
    <group rotation={[-Math.PI / 2.2, 0, 0.12]}>
      <mesh position={[x0 + L1 / 2, T / 2, 0]} castShadow material={baseMat}>
        <boxGeometry args={[L1, T, W]} />
      </mesh>
      <mesh position={[x0 + L1 + BA / 2, T / 2, 0]} castShadow material={zoneMat}>
        <boxGeometry args={[BA, T, W]} />
      </mesh>
      <mesh position={[x0 + L1 + BA + L2 / 2, T / 2, 0]} castShadow material={baseMat}>
        <boxGeometry args={[L2, T, W]} />
      </mesh>
    </group>
  );
}

function SceneBent(props: BendDevelopmentPreview3DProps) {
  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight castShadow intensity={1.1} position={[2.5, 4, 3]} shadow-mapSize={[512, 512]} />
      <directionalLight intensity={0.35} position={[-2, 1, -2]} />
      <BentStrip90
        baseHex={props.baseHex}
        insideRadiusIn={props.insideRadiusIn}
        leftLegIn={props.leftLegIn}
        rightLegIn={props.rightLegIn}
        stripWidthIn={props.stripWidthIn}
        thicknessIn={props.thicknessIn}
      />
      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>
      <OrbitControls enablePan={false} minDistance={1.2} maxDistance={4} />
    </>
  );
}

function SceneFlat(
  props: BendDevelopmentPreview3DProps & { baIn: number; bendZoneHex: string; baseHex: string }
) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight intensity={1.05} position={[2, 4, 2]} />
      <directionalLight intensity={0.3} position={[-2, 1, -1]} />
      <FlatStrip
        baseHex={props.baseHex}
        bendAllowanceIn={props.baIn}
        bendZoneHex={props.bendZoneHex}
        leftLegIn={props.leftLegIn}
        rightLegIn={props.rightLegIn}
        stripWidthIn={props.stripWidthIn}
        thicknessIn={props.thicknessIn}
      />
      <Suspense fallback={null}>
        <Environment preset="studio" />
      </Suspense>
      <OrbitControls enablePan={false} minDistance={0.85} maxDistance={3.5} />
    </>
  );
}

export default function BendDevelopmentPreview3D(props: BendDevelopmentPreview3DProps) {
  const bendZoneHex = props.bendZoneHex ?? "#f59e0b";
  const baseHex = props.baseHex ?? "#9ca3af";

  const baIn = useMemo(
    () =>
      bendAllowanceInches(
        props.bendAngleDeg,
        props.insideRadiusIn,
        props.thicknessIn,
        props.kFactor
      ),
    [props.bendAngleDeg, props.insideRadiusIn, props.thicknessIn, props.kFactor]
  );

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <p className="mb-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-gray-500">
          Bent (90° preview)
        </p>
        <div className="h-[220px] w-full overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-b from-white to-gray-50">
          <Canvas camera={{ position: [1.1, 0.85, 1.15], fov: 42 }} gl={{ antialias: true }} shadows>
            <SceneBent {...props} baseHex={baseHex} bendZoneHex={bendZoneHex} />
          </Canvas>
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-gray-500">
          Flat pattern (amber = BA)
        </p>
        <div className="h-[220px] w-full overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-b from-white to-gray-50">
          <Canvas camera={{ position: [0, 1.1, 1.25], fov: 42 }} gl={{ antialias: true }}>
            <SceneFlat {...props} baIn={baIn} baseHex={baseHex} bendZoneHex={bendZoneHex} />
          </Canvas>
        </div>
      </div>
    </div>
  );
}
