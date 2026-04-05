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

export function Configurator() {
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
    <div className="mx-auto max-w-[1600px] px-4 py-2 sm:px-6 lg:px-8">
      <header className="mb-6 border-b border-gray-200/80 pb-4">
        <p className="mb-3">
          <Link
            href="/portal"
            className="text-sm font-medium text-gray-600 underline-offset-2 hover:text-gray-900 hover:underline focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 rounded"
          >
            ← Order portal
          </Link>
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
          ACM panel layout
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Set dimensions and color, then use the fold &amp; bend preview like a CAD viewport.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="min-w-0 lg:col-span-5">
          <section className="rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="border-b border-gray-100 px-6 py-5 md:px-8">
              <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-500">
                Configuration
              </h2>
              <p className="mt-0.5 text-[15px] text-gray-500">
                Width, length, perimeter returns, and finish color.
              </p>
            </div>
            <div className="divide-y divide-gray-100 px-6 py-2 md:px-8">
              <div className="py-6">
                <SizePicker
                  value={size}
                  onChange={setSize}
                  thicknessId={INTERNAL_THICKNESS_ID}
                />
              </div>
              <div className="py-6">
                <ColorSwatches
                  value={colorId}
                  onChange={setColorId}
                  customColorReference={customColorReference}
                  onCustomColorReferenceChange={setCustomColorReference}
                  customColorSpecFile={customColorSpecFile}
                  onCustomColorSpecFileChange={setCustomColorSpecFile}
                />
              </div>
            </div>
          </section>
        </div>

        <div className="min-w-0 lg:col-span-7">
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
            expandedViewport
          />
        </div>
      </div>
    </div>
  );
}
