"use client";

import { useEffect } from "react";
import { colors } from "@/data/acm";
import { normalizeBoxTraySides } from "@/lib/boxTray";
import type { CartItem } from "@/types/cart";
import { TrayInteractivePreview } from "./AcmPanel3DPreview";

function previewDepthInFromThicknessId(thicknessId: string): number {
  const mm = Number(thicknessId.replace("mm", ""));
  if (Number.isNaN(mm)) return 0.12;
  const metalThicknessIn = mm / 25.4;
  return Math.min(3, Math.max(0.5, metalThicknessIn * 1.45 + 0.4));
}

export function PanelPreviewModal({
  item,
  open,
  onClose,
}: {
  item: CartItem | null;
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !item) return null;

  const color = colors.find((c) => c.id === item.colorId);
  const swatch =
    color && "swatchImage" in color && typeof (color as { swatchImage?: string }).swatchImage === "string"
      ? (color as { swatchImage: string }).swatchImage
      : undefined;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Panel 3D preview"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 shadow-xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-gray-900">
            {item.widthIn}&quot; × {item.heightIn}&quot; preview — drag to rotate
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
        <TrayInteractivePreview
          panelWidthIn={item.widthIn}
          panelHeightIn={item.heightIn}
          panelDepthIn={previewDepthInFromThicknessId(item.thicknessId)}
          boxSides={normalizeBoxTraySides(item.boxTraySides ?? [])}
          panelColorHex={color?.swatchHex ?? "#c8cdd3"}
          panelSwatchImage={swatch}
          heightPx={440}
          className="mx-auto"
        />
        <p className="mt-3 text-center text-xs text-gray-500">
          Zoom with + / −. Geometry matches your cart configuration (not the static thumbnail).
        </p>
      </div>
    </div>
  );
}
