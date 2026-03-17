"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  allWidths,
  colors,
  finishes,
  thicknesses,
  type ColorId,
  type ThicknessId,
} from "@/data/acm";
import { type QuoteDraft, QUOTE_DRAFT_STORAGE_KEY } from "@/types/quote";
import Link from "next/link";
import type { PanelType } from "@/lib/pricing";
import { useCart } from "@/context/CartContext";
import { ColorSwatches } from "./ColorSwatches";
import { MaterialCompositionDiagram } from "./MaterialCompositionDiagram";
import { PanelTypePicker } from "./PanelTypePicker";
import { PriceSummary } from "./PriceSummary";
import { QuantityPicker } from "./QuantityPicker";
import { SizePicker, type SizeSelection } from "./SizePicker";
import { ThicknessPicker } from "./ThicknessPicker";

const defaultSize: SizeSelection = {
  widthId: "custom",
  widthIn: 62,
  lengthIn: 96,
};

const MIN_WIDTH_IN = 12;
const MAX_WIDTH_IN = 62;
const MIN_LENGTH_IN = 12;
const MAX_LENGTH_IN = 190;

export interface PriceResult {
  areaFt2: number;
  totalSqFt: number;
  pricePerSqFt: number;
  total: number;
  panelType: PanelType;
  panelTypeLabel: string;
}

const DEBOUNCE_MS = 300;

function buildPriceBody(
  size: SizeSelection,
  thicknessId: ThicknessId,
  colorId: ColorId,
  qty: number,
  panelType: PanelType
) {
  const thicknessMm = Number(thicknessId.replace("mm", ""));
  return {
    widthIn: size.widthIn,
    lengthIn: size.lengthIn,
    thicknessMm,
    colorId,
    qty,
    panelType,
  };
}

export function Configurator() {
  const [size, setSize] = useState<SizeSelection>(defaultSize);
  const [colorId, setColorId] = useState<ColorId>("classic-white");
  const [thicknessId, setThicknessId] = useState<ThicknessId>("4mm");
  const [quantity, setQuantity] = useState(1);
  const [panelType, setPanelType] = useState<PanelType>("basic");

  const [pricing, setPricing] = useState<PriceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [panelDrawingFile, setPanelDrawingFile] = useState<File | null>(null);
  const router = useRouter();
  const { addItem } = useCart();

  const fetchPrice = useCallback(
    async (
      sizeVal: SizeSelection,
      thickness: ThicknessId,
      color: ColorId,
      qty: number,
      pType: PanelType
    ) => {
      const body = buildPriceBody(sizeVal, thickness, color, qty, pType);
      const res = await fetch("/api/price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to get price.");
      }
      return data as PriceResult;
    },
    []
  );

  useEffect(() => {
    setLoading(true);
    setError(null);
    const t = setTimeout(() => {
      fetchPrice(size, thicknessId, colorId, quantity, panelType)
        .then(setPricing)
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Something went wrong.");
          setPricing(null);
        })
        .finally(() => setLoading(false));
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [size, thicknessId, colorId, quantity, panelType, fetchPrice]);

  const color = colors.find((c) => c.id === colorId)!;
  const selectedWidth = allWidths.find((w) => w.id === size.widthId);
  const widthLabel = `${size.widthIn}"`;
  const thicknessMmNumeric = Number(thicknessId.replace("mm", ""));
  const edgeThicknessPx = Math.min(18, Math.max(4, thicknessMmNumeric / 0.5));

  const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));
  const widthRatio =
    (clamp(size.widthIn, MIN_WIDTH_IN, MAX_WIDTH_IN) - MIN_WIDTH_IN) / (MAX_WIDTH_IN - MIN_WIDTH_IN || 1);
  const lengthRatio =
    (clamp(size.lengthIn, MIN_LENGTH_IN, MAX_LENGTH_IN) - MIN_LENGTH_IN) / (MAX_LENGTH_IN - MIN_LENGTH_IN || 1);

  const handleAddToCart = () => {
    if (!pricing) return;
    const finish = finishes[0];
    const unitPrice = pricing.total / quantity;
    addItem({
      widthIn: size.widthIn,
      heightIn: size.lengthIn,
      standardId: size.widthId,
      colorId,
      finishId: finish.id,
      thicknessId,
      quantity,
      unitPrice,
      areaFt2: pricing.areaFt2,
      panelType: pricing.panelType,
      panelTypeLabel: pricing.panelTypeLabel,
    });
    router.push("/cart");
  };

  const handleRequestQuote = () => {
    if (!pricing) return;
    const finish = finishes[0];
    const thickness = thicknesses.find((t) => t.id === thicknessId);
    const draft: QuoteDraft = {
      widthIn: size.widthIn,
      lengthIn: size.lengthIn,
      widthId: size.widthId,
      thicknessId,
      colorId,
      finishId: finish.id,
      quantity,
      areaFt2PerPanel: pricing.areaFt2,
      totalSqFt: pricing.totalSqFt,
      estimatedTotal: pricing.total,
      panelType: pricing.panelType,
      panelTypeLabel: pricing.panelTypeLabel,
      widthLabel,
      thicknessLabel: thickness?.label ?? thicknessId,
      colorName: color.name,
      colorCode: color.code,
      finishLabel: finish.label,
      colorAvailability: color.availability,
      colorLeadTimeDaysRange: color.leadTimeDaysRange,
      widthAvailability: selectedWidth?.availability ?? "Made to Order",
      widthLeadTimeDaysRange: selectedWidth?.leadTimeDaysRange ?? [7, 14],
      productKind: "acm",
      productLabel: "ACM Panels",
      returnUrl: "/products/acm-panels",
    };
    if (typeof window !== "undefined") {
      sessionStorage.setItem(QUOTE_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    }
    router.push("/quote");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="mb-12 md:mb-16">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          ACM Panel Configurator
        </h1>
        <p className="mt-2 text-[15px] text-gray-500">
          Configure your panels. Pricing updates automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <section className="rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="border-b border-gray-100 px-6 py-5 md:px-8">
              <h2 className="text-[13px] font-medium uppercase tracking-wider text-gray-500">
                Configuration
              </h2>
              <p className="mt-0.5 text-[13px] text-gray-500">
                Choose thickness, size, color, and quantity.
              </p>
            </div>
            <div className="divide-y divide-gray-100 px-6 py-6 md:px-8">
              <div id="panel-type" className="pb-6 scroll-mt-24">
                <PanelTypePicker value={panelType} onChange={setPanelType} />
                {panelType === "custom" && (
                  <div className="mt-4 rounded-xl border border-gray-200/80 bg-gray-50/50 p-4">
                    <p className="text-[13px] text-gray-700">Non-square panels will need drawings.</p>
                    <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[14px] font-medium text-gray-900 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-gray-400 focus-within:ring-offset-2">
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        className="sr-only"
                        onChange={(e) => setPanelDrawingFile(e.target.files?.[0] ?? null)}
                      />
                      Upload panel drawing
                    </label>
                    {panelDrawingFile && (
                      <p className="mt-2 text-[12px] text-gray-600">{panelDrawingFile.name}</p>
                    )}
                  </div>
                )}
              </div>
              <div id="thickness" className="py-6 scroll-mt-24">
                <ThicknessPicker value={thicknessId} onChange={setThicknessId} />
              </div>
              <div id="size" className="py-6 scroll-mt-24">
                <SizePicker value={size} onChange={setSize} thicknessId={thicknessId} />
              </div>
              <div id="color" className="py-6 scroll-mt-24">
                <ColorSwatches value={colorId} onChange={setColorId} />
              </div>
              <div id="quantity" className="pt-6 scroll-mt-24">
                <QuantityPicker value={quantity} onChange={setQuantity} />
              </div>
            </div>
          </section>
        </div>

        <div id="estimate" className="lg:col-span-5 scroll-mt-24">
          <div className="lg:sticky lg:top-28 space-y-5">
            <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:p-6" aria-labelledby="panel-preview-heading">
              <h2 id="panel-preview-heading" className="text-[13px] font-medium uppercase tracking-wider text-gray-500">
                Panel Preview
              </h2>
              <div className="mt-4">
                <div
                  className="relative w-full overflow-visible rounded-2xl"
                  style={{
                    aspectRatio: "4 / 3",
                  }}
                  role="img"
                  aria-label={`Panel elevation preview: ${size.widthIn} by ${size.lengthIn} inches, ${color.name} (${color.code}), ${finishes[0].label}, ${
                    thicknesses.find((t) => t.id === thicknessId)?.label ?? thicknessId
                  }`}
                >
                  {/* Wall background */}
                  <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top_left,_#f9fafb,_#e5e7eb)]" />
                  <div className="absolute inset-[10%] rounded-xl border border-gray-300/80 bg-[repeating-linear-gradient(135deg,_rgba(255,255,255,0.7),_rgba(255,255,255,0.7)_8px,_rgba(243,244,246,0.9)_8px,_rgba(243,244,246,0.9)_16px)]" />

                  {/* Panel on concrete wall */}
                  <div
                    className="absolute inset-[18%] flex items-center justify-center"
                  >
                    <div
                      className="relative h-full w-full rounded-md shadow-[0_12px_22px_rgba(15,23,42,0.35)]"
                    >
                      <div
                        className="absolute inset-0 rounded-md border border-black/15 bg-cover bg-center"
                        style={
                          "swatchImage" in color && typeof (color as { swatchImage?: string }).swatchImage === "string"
                            ? {
                                backgroundImage: `url(${(color as { swatchImage: string }).swatchImage})`,
                                backgroundColor: color.hex,
                                boxShadow:
                                  "0 0 0 1px rgba(15,23,42,0.12) inset, 0 32px 70px rgba(15,23,42,0.45)",
                              }
                            : {
                                backgroundColor: color.hex,
                                boxShadow:
                                  "0 0 0 1px rgba(15,23,42,0.16) inset, 0 24px 42px rgba(15,23,42,0.45)",
                              }
                        }
                      />

                      {/* Specular highlight */}
                      <div
                        className="pointer-events-none absolute inset-0 rounded-md"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.12) 40%, transparent 65%, rgba(15,23,42,0.14) 100%)",
                          mixBlendMode: "soft-light",
                        }}
                      />
                    </div>
                  </div>

                  {/* Ground shadow */}
                  <div className="absolute -bottom-4 left-0 right-0 mx-auto h-9 max-w-sm rounded-full bg-black/5 blur-2xl" />

                  {/* Horizontal scale (width) */}
                  <div className="pointer-events-none absolute bottom-2 left-[18%] right-[14%]">
                    <div className="relative h-5">
                      <div className="absolute bottom-2 left-0 h-[1px] w-full bg-gray-400/70" />
                      <div className="absolute bottom-1 left-0 h-2 w-[1px] bg-gray-500" />
                      <div className="absolute bottom-1 right-0 h-2 w-[1px] bg-gray-500" />
                      <div
                        className="absolute bottom-2 left-1/2 h-[3px] -translate-x-1/2 rounded-full bg-gray-700"
                        style={{ width: `${35 + widthRatio * 45}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] font-medium text-gray-700 text-center">
                      Width: {size.widthIn.toFixed(0)} in (scaled)
                    </p>
                  </div>

                  {/* Vertical scale (length) */}
                  <div className="pointer-events-none absolute top-[18%] bottom-[20%] left-[10%] flex flex-col items-center justify-between">
                    <div className="relative h-full w-8">
                      <div className="absolute left-1/2 top-0 h-full w-[1px] -translate-x-1/2 bg-gray-400/70" />
                      <div className="absolute left-1/2 top-0 h-2 w-[1px] -translate-x-1/2 bg-gray-500" />
                      <div className="absolute left-1/2 bottom-0 h-2 w-[1px] -translate-x-1/2 bg-gray-500" />
                      <div
                        className="absolute left-1/2 top-1/2 w-[3px] -translate-x-1/2 rounded-full bg-gray-700"
                        style={{ height: `${32 + lengthRatio * 48}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] font-medium text-gray-700 text-center">
                      Length: {size.lengthIn.toFixed(0)} in (scaled)
                    </p>
                  </div>

                  {/* Label chip */}
                  <div className="absolute top-3 right-3 max-w-[70%] rounded-lg bg-white/90 px-2.5 py-1.5 text-[10px] font-medium text-gray-700 shadow-[0_1px_3px_rgba(0,0,0,0.18)] backdrop-blur-md">
                    <p className="leading-snug">
                      {color.name} ({color.code}) · {thicknesses.find((t) => t.id === thicknessId)?.label ?? thicknessId}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[13px] text-gray-600">
                  {size.widthIn} × {size.lengthIn} in · {(pricing?.areaFt2 ?? 0).toFixed(2)} ft² per panel
                </p>
              </div>
            </section>
            <PriceSummary
              pricing={pricing}
              loading={loading}
              error={error}
            />
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={loading || !!error || !pricing}
              className="w-full rounded-xl bg-gray-900 px-5 py-4 text-[15px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>

      <section className="mt-20 border-t border-gray-200/80 pt-16" aria-labelledby="material-composition-heading">
        <h2 id="material-composition-heading" className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          Material Composition
        </h2>
        <p className="mt-2 text-[15px] text-gray-500">
          Fire-resistant metal composite material (FR MCM) uses a mineral-filled core in place of plastic, meeting stringent fire ratings for exterior applications. The sandwich construction—aluminum skins bonded to a non-combustible core—delivers durability, formability, and compliance with building codes.
        </p>
        <div className="mt-10 flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-center">
          <MaterialCompositionDiagram />
        </div>
      </section>

      <section className="mt-20 border-t border-gray-200/80 pt-16" aria-labelledby="technical-resources-heading">
        <h2 id="technical-resources-heading" className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          Technical Resources
        </h2>
        <p className="mt-2 text-[15px] text-gray-500">
          Specifications, finishes, and support documentation.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/resources/alfrex-fr-technical-data-sheet"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors hover:border-gray-300/80 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            <h3 className="text-[15px] font-medium text-gray-900 group-hover:text-gray-800">Alfrex FR Technical Data Sheet</h3>
            <span className="mt-2 inline-block text-[13px] text-gray-500 group-hover:text-gray-700">View PDF →</span>
          </Link>
          <Link
            href="/resources/alfrex-standard-finishes-catalog"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors hover:border-gray-300/80 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            <h3 className="text-[15px] font-medium text-gray-900 group-hover:text-gray-800">Alfrex Standard Finishes Catalog</h3>
            <span className="mt-2 inline-block text-[13px] text-gray-500 group-hover:text-gray-700">View PDF →</span>
          </Link>
          <Link
            href="/resources/installation-guidelines"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors hover:border-gray-300/80 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            <h3 className="text-[15px] font-medium text-gray-900 group-hover:text-gray-800">Installation Guidelines</h3>
            <span className="mt-2 inline-block text-[13px] text-gray-500 group-hover:text-gray-700">View PDF →</span>
          </Link>
          <Link
            href="/resources/warranty-information"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors hover:border-gray-300/80 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            <h3 className="text-[15px] font-medium text-gray-900 group-hover:text-gray-800">Warranty Information</h3>
            <span className="mt-2 inline-block text-[13px] text-gray-500 group-hover:text-gray-700">View PDF →</span>
          </Link>
        </div>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
          <Link
            href="/resources/alfrex-fr-spec-sheet.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-xl bg-gray-900 px-6 py-3.5 text-[15px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            View the official Alfrex FR spec sheet (PDF)
          </Link>
          <Link
            href="/consultation"
            className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-[15px] font-medium text-gray-900 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Need help specifying? Upload plans for consultation.
          </Link>
        </div>
      </section>

      <section className="mt-20 border-t border-gray-200/80 pt-16" aria-labelledby="trust-heading">
        <h2 id="trust-heading" className="sr-only">
          Product and service information
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h3 className="text-[15px] font-medium text-gray-900">FR Rated Panels</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">
              Fire-resistant ACM panels meet building codes for exterior applications.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h3 className="text-[15px] font-medium text-gray-900">Lead Times</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">
              Availability and lead times are confirmed with your final quote based on project size, finish selection, and delivery location.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h3 className="text-[15px] font-medium text-gray-900">Cut-to-Length</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">
              Custom lengths from 12 in to 300 in. Specify your size when configuring.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h3 className="text-[15px] font-medium text-gray-900">Nationwide Shipping</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">
              We ship across the US. Delivery options and pricing provided with your quote.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
