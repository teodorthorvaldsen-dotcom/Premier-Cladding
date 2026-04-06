"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { colors, type ColorId, type ThicknessId } from "@/data/acm";
import type { PanelType } from "@/lib/pricing";
import { defaultFullTraySides } from "@/lib/boxTray";
import { AcmPanel3DPreview } from "./AcmPanel3DPreview";
import { ColorSwatches } from "./ColorSwatches";
import { SizePicker, type SizeSelection } from "./SizePicker";

/** Kept for `PriceSummary` and any tooling that still imports this type from here. */
export interface PriceResult {
  areaFt2: number;
  totalSqFt: number;
  pricePerSqFt: number;
  total: number;
  panelType: PanelType;
  panelTypeLabel: string;
}

const defaultSize: SizeSelection = {
  widthId: "custom",
  widthIn: 62,
  lengthIn: 96,
  boxSides: defaultFullTraySides(),
};

/** Fixed for layout / max-length rules; not shown in the employee UI. */
const INTERNAL_THICKNESS_ID = "4mm" satisfies ThicknessId;

export function EmployeeAcmWorkspace() {
  const [size, setSize] = useState<SizeSelection>(defaultSize);
  const [colorId, setColorId] = useState<ColorId>("classic-white");
  const [customColorReference, setCustomColorReference] = useState("");
  const [customColorSpecFile, setCustomColorSpecFile] = useState<File | null>(null);

  useEffect(() => {
    if (colorId !== "custom-color-match") {
      setCustomColorReference("");
      setCustomColorSpecFile(null);
    }
  }, [colorId]);

  const color = colors.find((c) => c.id === colorId)!;
  const thicknessMm = 4;
  const metalThicknessIn = thicknessMm / 25.4;
  const previewDepthIn = Math.min(3, Math.max(0.5, metalThicknessIn * 1.45 + 0.4));

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#d0d0d0]">
      <header className="flex shrink-0 items-center gap-3 border-b border-gray-400 bg-gradient-to-b from-[#f4f4f4] to-[#e2e2e2] px-3 py-2 shadow-sm">
        <Link
          href="/portal"
          className="shrink-0 text-xs font-semibold text-gray-700 underline-offset-2 hover:text-gray-900 hover:underline focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 rounded"
        >
          ΓåÉ Order portal
        </Link>
        <span className="hidden h-4 w-px bg-gray-400 sm:block" aria-hidden />
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold tracking-tight text-gray-900">ACM panel layout</h1>
          <p className="truncate text-[10px] text-gray-600">Viewport-first workspace ┬╖ properties on the left</p>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="flex max-h-[42vh] w-full shrink-0 flex-col border-b border-gray-400 bg-[#f2f2f2] md:max-h-none md:h-full md:w-72 md:border-b-0 md:border-r md:border-gray-400 lg:w-80">
          <div className="shrink-0 border-b border-gray-300 bg-[#e6e6e6] px-2.5 py-2">
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-gray-800">Properties</h2>
            <p className="mt-0.5 text-[10px] leading-snug text-gray-600">Panel ┬╖ tray / returns ┬╖ finish</p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-2.5 py-3">
            <section className="border-b border-gray-300/90 pb-4">
              <SizePicker
                value={size}
                onChange={setSize}
                thicknessId={INTERNAL_THICKNESS_ID}
                variant="propertiesPanel"
              />
            </section>
            <section className="pt-4">
              <ColorSwatches
                value={colorId}
                onChange={setColorId}
                customColorReference={customColorReference}
                onCustomColorReferenceChange={setCustomColorReference}
                customColorSpecFile={customColorSpecFile}
                onCustomColorSpecFileChange={setCustomColorSpecFile}
                variant="propertiesPanel"
              />
            </section>
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#b9b9b9] p-1 sm:p-1.5">
          <div className="flex min-h-[min(280px,50dvh)] min-w-0 flex-1 flex-col overflow-hidden rounded-sm border border-gray-500 bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] md:min-h-0">
            <AcmPanel3DPreview
              panelWidthIn={size.widthIn}
              panelHeightIn={size.lengthIn}
              panelDepthIn={previewDepthIn}
              boxSides={size.boxSides}
              panelColorHex={color.swatchHex}
              panelColorName={color.name}
              panelSwatchImage={
                "swatchImage" in color &&
                typeof (color as { swatchImage?: string }).swatchImage === "string"
                  ? (color as { swatchImage: string }).swatchImage
                  : undefined
              }
              workspaceLayout
            />
          </div>
        </div>
      </div>
    </div>
  );
}
