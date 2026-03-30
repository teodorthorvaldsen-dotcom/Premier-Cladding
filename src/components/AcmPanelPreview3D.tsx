"use client";

import React, { Suspense, useEffect, useLayoutEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";

type FoldSide = { depth: number; angle: number };

export type AcmPanelPreview3DProps = {
  width: number;
  length: number;
  thickness?: number;
  color?: string;
  swatchImage?: string;
  topFold?: FoldSide;
  bottomFold?: FoldSide;
  leftFold?: FoldSide;
  rightFold?: FoldSide;
};

type FoldPanelProps = Omit<AcmPanelPreview3DProps, "swatchImage"> & {
  map: THREE.Texture | null;
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const degToRad = (deg: number) => (deg * Math.PI) / 180;

function getSceneScale(width: number, length: number) {
  return 3.5 / Math.max(width, length, 1);
}

function FoldPanelTextured({
  imageUrl,
  ...rest
}: Omit<AcmPanelPreview3DProps, "swatchImage"> & { imageUrl: string }) {
  const map = useTexture(imageUrl);
  useLayoutEffect(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.ClampToEdgeWrapping;
    map.anisotropy = 8;
    map.needsUpdate = true;
  }, [map]);
  return <FoldPanel {...rest} map={map} />;
}

function FoldPanel({
  width,
  length,
  thickness = 4,
  color = "#f2f2f2",
  map,
  topFold = { depth: 0, angle: 0 },
  bottomFold = { depth: 0, angle: 0 },
  leftFold = { depth: 0, angle: 0 },
  rightFold = { depth: 0, angle: 0 },
}: FoldPanelProps) {
  const scale = getSceneScale(width, length);

  const dims = useMemo(() => {
    const topDepth = clamp(topFold.depth || 0, 0, length / 2 - 0.25);
    const bottomDepth = clamp(bottomFold.depth || 0, 0, length / 2 - 0.25);
    const leftDepth = clamp(leftFold.depth || 0, 0, width / 2 - 0.25);
    const rightDepth = clamp(rightFold.depth || 0, 0, width / 2 - 0.25);

    const centerW = Math.max(1, width - leftDepth - rightDepth);
    const centerL = Math.max(1, length - topDepth - bottomDepth);

    return {
      topDepth,
      bottomDepth,
      leftDepth,
      rightDepth,
      centerW,
      centerL,
      thicknessWorld: Math.max(0.03, thickness * 0.01),
    };
  }, [width, length, thickness, topFold, bottomFold, leftFold, rightFold]);

  const panelMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: map ? "#ffffff" : color,
      map: map ?? undefined,
      metalness: map ? 0.06 : 0.15,
      roughness: map ? 0.72 : 0.7,
      side: THREE.DoubleSide,
    });
  }, [color, map]);

  useEffect(() => () => panelMat.dispose(), [panelMat]);

  const centerW = dims.centerW * scale;
  const centerL = dims.centerL * scale;
  const thicknessWorld = dims.thicknessWorld * scale;
  const topDepth = dims.topDepth * scale;
  const bottomDepth = dims.bottomDepth * scale;
  const leftDepth = dims.leftDepth * scale;
  const rightDepth = dims.rightDepth * scale;

  const topAngle = degToRad(clamp(topFold.angle || 0, 0, 180));
  const bottomAngle = degToRad(clamp(bottomFold.angle || 0, 0, 180));
  const leftAngle = degToRad(clamp(leftFold.angle || 0, 0, 180));
  const rightAngle = degToRad(clamp(rightFold.angle || 0, 0, 180));

  return (
    <group rotation={[-0.55, 0.65, 0]}>
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[centerW, centerL, thicknessWorld]} />
        <primitive object={panelMat} attach="material" />
      </mesh>

      {topDepth > 0 && (
        <group position={[0, centerL / 2, 0]}>
          <group rotation={[topAngle, 0, 0]}>
            <mesh castShadow position={[0, topDepth / 2, 0]}>
              <boxGeometry args={[centerW, topDepth, thicknessWorld]} />
              <primitive object={panelMat} attach="material" />
            </mesh>
          </group>
        </group>
      )}

      {bottomDepth > 0 && (
        <group position={[0, -centerL / 2, 0]}>
          <group rotation={[-bottomAngle, 0, 0]}>
            <mesh castShadow position={[0, -bottomDepth / 2, 0]}>
              <boxGeometry args={[centerW, bottomDepth, thicknessWorld]} />
              <primitive object={panelMat} attach="material" />
            </mesh>
          </group>
        </group>
      )}

      {leftDepth > 0 && (
        <group position={[-centerW / 2, 0, 0]}>
          <group rotation={[0, leftAngle, 0]}>
            <mesh castShadow position={[-leftDepth / 2, 0, 0]}>
              <boxGeometry args={[leftDepth, centerL, thicknessWorld]} />
              <primitive object={panelMat} attach="material" />
            </mesh>
          </group>
        </group>
      )}

      {rightDepth > 0 && (
        <group position={[centerW / 2, 0, 0]}>
          <group rotation={[0, -rightAngle, 0]}>
            <mesh castShadow position={[rightDepth / 2, 0, 0]}>
              <boxGeometry args={[rightDepth, centerL, thicknessWorld]} />
              <primitive object={panelMat} attach="material" />
            </mesh>
          </group>
        </group>
      )}

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.3, 0]}>
        <planeGeometry args={[8, 8]} />
        <shadowMaterial opacity={0.18} />
      </mesh>
    </group>
  );
}

function PreviewScene(props: AcmPanelPreview3DProps) {
  const { swatchImage, ...rest } = props;
  return (
    <>
      {swatchImage ? (
        <FoldPanelTextured {...rest} imageUrl={swatchImage} />
      ) : (
        <FoldPanel {...rest} map={null} />
      )}
      <Environment preset="city" />
    </>
  );
}

export default function AcmPanelPreview3D(props: AcmPanelPreview3DProps) {
  return (
    <div className="h-[360px] w-full overflow-hidden rounded-xl bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfc_100%)]">
      <Canvas
        shadows
        camera={{ position: [0, 0.2, 4.2], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.85} />
        <directionalLight
          castShadow
          intensity={1.15}
          position={[4, 6, 6]}
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight intensity={0.4} position={[-3, 2, -4]} />
        <Suspense fallback={null}>
          <PreviewScene {...props} />
        </Suspense>
        <OrbitControls
          enablePan={false}
          maxDistance={10}
          maxPolarAngle={Math.PI / 1.75}
          minDistance={2.8}
          minPolarAngle={Math.PI / 5}
        />
      </Canvas>
    </div>
  );
}
