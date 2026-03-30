"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export interface FoldedPanelWebGLProps {
  widthIn: number;
  heightIn: number;
  foldFromLeftIn: number | null;
  foldFromBottomIn: number | null;
  /** Total panel / skin thickness in inches (for subtle mesh depth). */
  thicknessIn: number;
  panelColorHex: string;
  panelSwatchImage?: string;
}

const MIN_GAP = 1e-3;

function applyPanelMaterial(
  mesh: THREE.Mesh,
  hex: string,
  texture: THREE.Texture | null
): void {
  if (texture) {
    mesh.material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.45,
      metalness: 0.08,
    });
  } else {
    const c = new THREE.Color(hex);
    mesh.material = new THREE.MeshStandardMaterial({
      color: c,
      roughness: 0.55,
      metalness: 0.12,
    });
  }
}

/**
 * Y-up scene: base in XZ plane (width X, depth Z), walls fold upward (+Y).
 */
export function FoldedPanelWebGL({
  widthIn: W,
  heightIn: H,
  foldFromLeftIn,
  foldFromBottomIn,
  thicknessIn,
  panelColorHex,
  panelSwatchImage,
}: FoldedPanelWebGLProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const tVis = Math.max(0.02, Math.min(thicknessIn * 4, 0.12));

    const L = foldFromLeftIn != null ? foldFromLeftIn : W;
    const B = foldFromBottomIn != null ? foldFromBottomIn : H;

    const hasRight = foldFromLeftIn != null && W - L > MIN_GAP;
    const hasBack = foldFromBottomIn != null && H - B > MIN_GAP;

    const width = container.clientWidth || 480;
    const height = Math.round((width * 360) / 520) || 320;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.05, 500);

    const amb = new THREE.AmbientLight(0xffffff, 0.72);
    scene.add(amb);
    const dir = new THREE.DirectionalLight(0xffffff, 0.85);
    dir.position.set(2.2, 3.5, 2.8);
    scene.add(dir);
    const fill = new THREE.DirectionalLight(0xe8eef5, 0.35);
    fill.position.set(-2, 1.5, -1.5);
    scene.add(fill);

    const root = new THREE.Group();
    scene.add(root);

    let cancelled = false;
    let loadedTexture: THREE.Texture | null = null;
    const loadTex = (url: string) => {
      const loader = new THREE.TextureLoader();
      loader.load(
        url,
        (tx) => {
          if (cancelled) {
            tx.dispose();
            return;
          }
          tx.colorSpace = THREE.SRGBColorSpace;
          tx.wrapS = THREE.ClampToEdgeWrapping;
          tx.wrapT = THREE.ClampToEdgeWrapping;
          loadedTexture = tx;
          root.traverse((o) => {
            if (o instanceof THREE.Mesh) applyPanelMaterial(o, panelColorHex, loadedTexture);
          });
        },
        undefined,
        () => {}
      );
    };
    if (panelSwatchImage) loadTex(panelSwatchImage);

    const addBox = (gw: number, gh: number, gd: number, px: number, py: number, pz: number) => {
      const geom = new THREE.BoxGeometry(gw, gh, gd);
      const mesh = new THREE.Mesh(geom);
      mesh.position.set(px, py, pz);
      applyPanelMaterial(mesh, panelColorHex, texture);
      root.add(mesh);
      return mesh;
    };

    if (!hasRight && !hasBack) {
      addBox(W, tVis, H, W / 2, tVis / 2, H / 2);
    } else if (hasRight && !hasBack) {
      const rw = W - L;
      addBox(L, tVis, H, L / 2, tVis / 2, H / 2);
      const gR = new THREE.Group();
      gR.position.set(L, tVis / 2, H / 2);
      gR.rotation.y = Math.PI / 2;
      const meshR = new THREE.Mesh(new THREE.BoxGeometry(rw, tVis, H));
      meshR.position.set(rw / 2, 0, 0);
      applyPanelMaterial(meshR, panelColorHex, texture);
      gR.add(meshR);
      root.add(gR);
    } else if (!hasRight && hasBack) {
      const bh = H - B;
      addBox(W, tVis, B, W / 2, tVis / 2, B / 2);
      const gB = new THREE.Group();
      gB.position.set(W / 2, tVis / 2, B);
      gB.rotation.x = -Math.PI / 2;
      const meshB = new THREE.Mesh(new THREE.BoxGeometry(W, tVis, bh));
      meshB.position.set(0, 0, bh / 2);
      applyPanelMaterial(meshB, panelColorHex, texture);
      gB.add(meshB);
      root.add(gB);
    } else {
      const rw = W - L;
      const bh = H - B;
      addBox(L, tVis, B, L / 2, tVis / 2, B / 2);

      const gR = new THREE.Group();
      gR.position.set(L, tVis / 2, B / 2);
      gR.rotation.y = Math.PI / 2;
      const meshR = new THREE.Mesh(new THREE.BoxGeometry(rw, tVis, B));
      meshR.position.set(rw / 2, 0, 0);
      applyPanelMaterial(meshR, panelColorHex, texture);
      gR.add(meshR);
      root.add(gR);

      const gB = new THREE.Group();
      gB.position.set(L / 2, tVis / 2, B);
      gB.rotation.x = -Math.PI / 2;
      const meshB = new THREE.Mesh(new THREE.BoxGeometry(L, tVis, bh));
      meshB.position.set(0, 0, bh / 2);
      applyPanelMaterial(meshB, panelColorHex, texture);
      gB.add(meshB);
      root.add(gB);
    }

    const maxDim = Math.max(W, H, tVis * 6);
    const cx = W / 2;
    const cz = H / 2;
    const cy = maxDim * 0.22;
    camera.position.set(cx + maxDim * 0.95, cy + maxDim * 0.75, cz + maxDim * 0.92);
    camera.lookAt(cx, tVis, cz * 0.92);

    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      renderer.render(scene, camera);
    };
    tick();

    const ro = new ResizeObserver(() => {
      const w = container.clientWidth || width;
      const h = Math.max(200, Math.round((w * 360) / 520));
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(container);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      ro.disconnect();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
      root.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          const m = o.material;
          if (!Array.isArray(m)) {
            m.dispose();
          }
        }
      });
    };
  }, [
    W,
    H,
    foldFromLeftIn,
    foldFromBottomIn,
    thicknessIn,
    panelColorHex,
    panelSwatchImage,
  ]);

  return (
    <div
      ref={containerRef}
      className="mx-auto w-full max-w-[520px]"
      style={{ minHeight: 200 }}
      aria-hidden
    />
  );
}
