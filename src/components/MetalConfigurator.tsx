"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MetalPriceSummary } from "./MetalPriceSummary";
import { GaugePicker, type GaugeId } from "./GaugePicker";
import { MaterialPicker, type MetalMaterialId } from "./MaterialPicker";
import {
  METAL_SYSTEM_OPTIONS,
  SystemPicker,
  type MetalSystemId,
} from "./SystemPicker";
import { PacCladColorSwatches } from "./PacCladColorSwatches";
import {
  pacCladColors,
  type PacCladColorId,
  type PacCladFinishType,
} from "@/data/pacCladColors";
import { type QuoteDraft, QUOTE_DRAFT_STORAGE_KEY } from "@/types/quote";

const LABOR_RATE_PER_HOUR = 26;
const LABOR_HOURS_PER_SQFT = 0.08;

const BASE_MATERIAL_COST_PER_SQFT: Record<MetalMaterialId, number> = {
  steel: 7.5,
  aluminum: 9.25,
};

const GAUGE_ADJUSTMENT: Partial<Record<GaugeId, number>> = {
  "22 ga": 1.08,
  "24 ga": 1.0,
  "0.040": 1.0,
  "0.050": 1.07,
};

const FINISH_CATEGORY_MULTIPLIER: Partial<Record<PacCladFinishType, number>> = {
  Solid: 1.0,
  Metallic: 1.08,
  Mica: 1.05,
  Timber: 1.12,
  Other: 1.1,
};

const SYSTEM_MULTIPLIER: Record<MetalSystemId, number> = {
  "flush-reveal": 1.0,
  "board-batten": 1.15,
  "precision-series": 1.25,
  "exposed-fastener": 0.95,
  "specialty-custom": 0,
};

const DEFAULT_COLOR_ID: PacCladColorId = pacCladColors[0]?.id ?? "bone-white";
const DEFAULT_SYSTEM_ID: MetalSystemId = "flush-reveal";
const DEFAULT_MATERIAL: MetalMaterialId = "steel";
const DEFAULT_GAUGE: GaugeId = "24 ga";

const VALID_SYSTEM_IDS: MetalSystemId[] = [
  "flush-reveal",
  "board-batten",
  "precision-series",
  "exposed-fastener",
  "specialty-custom",
];

function toMetalSystemId(key: string): MetalSystemId {
  return VALID_SYSTEM_IDS.includes(key as MetalSystemId) ? (key as MetalSystemId) : "precision-series";
}

export interface MetalConfiguratorProps {
  /** When set, configurator uses this as the panel system (e.g. from Systems browser "Add to Estimate"). */
  externalSystemId?: MetalSystemId | null;
  /** Called when panel system is changed (from picker or externally). */
  onExternalSystemIdChange?: (id: MetalSystemId) => void;
}

export function MetalConfigurator({
  externalSystemId,
  onExternalSystemIdChange,
}: MetalConfiguratorProps = {}) {
  const router = useRouter();

  const [internalSystemId, setInternalSystemId] = useState<MetalSystemId>(DEFAULT_SYSTEM_ID);
  const systemId =
    externalSystemId !== undefined && externalSystemId !== null
      ? toMetalSystemId(externalSystemId)
      : internalSystemId;
  const setSystemId = (next: MetalSystemId) => {
    if (onExternalSystemIdChange) onExternalSystemIdChange(next);
    else setInternalSystemId(next);
  };
  const [material, setMaterial] = useState<MetalMaterialId>(DEFAULT_MATERIAL);
  const [gauge, setGauge] = useState<GaugeId>(DEFAULT_GAUGE);
  type AttachmentType = "with_clips" | "without_clips" | null;
  const [attachmentType, setAttachmentType] = useState<AttachmentType>(null);
  const [colorId, setColorId] = useState<PacCladColorId>(DEFAULT_COLOR_ID);
  const [totalSqFtInput, setTotalSqFtInput] = useState<string>("1000");
  const [projectState, setProjectState] = useState<string>("");
  const [projectPostalCode, setProjectPostalCode] = useState<string>("");

  const totalSqFt = useMemo(() => {
    const parsed = Number(totalSqFtInput.replace(",", "").trim());
    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return parsed;
  }, [totalSqFtInput]);

  const selectedSystem = METAL_SYSTEM_OPTIONS.find((s) => s.id === systemId)!;
  const selectedColor = pacCladColors.find((c) => c.id === colorId)!;

  const isSpecialty = systemId === "specialty-custom";
  const requiresAttachment = systemId === "precision-series";
  const attachmentSelected = !requiresAttachment || attachmentType !== null;
  const hasEstimate = !isSpecialty && totalSqFt >= 10 && attachmentSelected;

  const laborPerSqFt = LABOR_RATE_PER_HOUR * LABOR_HOURS_PER_SQFT;

  const { pricePerSqFt, materialSubtotal, laborSubtotal } = useMemo(() => {
    if (!hasEstimate) {
      return {
        pricePerSqFt: 0,
        materialSubtotal: 0,
        laborSubtotal: 0,
      };
    }

    const base = BASE_MATERIAL_COST_PER_SQFT[material];
    const gaugeFactor = GAUGE_ADJUSTMENT[gauge] ?? 1;
    const finishFactor = FINISH_CATEGORY_MULTIPLIER[selectedColor.finishType] ?? 1;
    const systemFactor = SYSTEM_MULTIPLIER[systemId] || 1;
    const attachmentFactor =
      systemId === "precision-series" && attachmentType === "with_clips" ? 1.08 : 1;

    const materialPerSqFt = base * gaugeFactor * finishFactor * systemFactor * attachmentFactor;
    const materialTotal = materialPerSqFt * totalSqFt;
    const laborTotal = laborPerSqFt * totalSqFt;
    const totalPerSqFt = materialPerSqFt + laborPerSqFt;

    return {
      pricePerSqFt: totalPerSqFt,
      materialSubtotal: materialTotal,
      laborSubtotal: laborTotal,
    };
  }, [hasEstimate, material, gauge, selectedColor.finishType, systemId, totalSqFt, laborPerSqFt]);

  const handleMaterialChange = (next: MetalMaterialId) => {
    setMaterial(next);
    // Adjust default gauge when switching materials to keep values intuitive.
    if (next === "steel" && (gauge === "0.040" || gauge === "0.050")) {
      setGauge("24 ga");
    }
    if (next === "aluminum" && (gauge === "22 ga" || gauge === "24 ga")) {
      setGauge("0.040");
    }
  };

  const handleRequestQuote = () => {
    if (isSpecialty) {
      router.push("/products/pac-clad-panels/consultation");
      return;
    }
    if (!hasEstimate) return;

    const draft: QuoteDraft = {
      // Legacy ACM fields – populated with neutral values so the quote flow remains compatible.
      widthIn: 0,
      lengthIn: 0,
      widthId: null,
      thicknessId: gauge,
      colorId,
      finishId: "standard",
      quantity: 0,
      areaFt2PerPanel: 0,
      totalSqFt,
      estimatedTotal: materialSubtotal + laborSubtotal,
      panelType: "metal-wall-system",
      panelTypeLabel: selectedSystem.label,
      widthLabel: "N/A",
      thicknessLabel: gauge,
      colorName: selectedColor.name,
      colorCode: selectedColor.code,
      finishLabel: selectedColor.finishType,
      productKind: "metal",
      productLabel: "Metal Wall Panel System",
      returnUrl: "/products/pac-clad-panels",
      metalSystemId: systemId,
      metalSystemLabel: selectedSystem.label,
      metalMaterial: material === "steel" ? "Steel" : "Aluminum",
      metalGauge: gauge,
      metalFinishCategory: selectedColor.finishType,
      metalColorId: colorId,
      metalColorName: selectedColor.name,
      metalColorCode: selectedColor.code,
      metalTotalSqFt: totalSqFt,
      metalPricePerSqFt: pricePerSqFt,
      metalMaterialSubtotal: materialSubtotal,
      metalLaborSubtotal: laborSubtotal,
      metalLocationState: projectState || undefined,
      metalLocationPostalCode: projectPostalCode || undefined,
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem(QUOTE_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    }
    router.push("/quote");
  };

  return (
    <section
      aria-labelledby="metal-configurator-heading"
      className="pb-12 sm:pb-16 lg:pb-20"
    >
      <div className="mb-8 md:mb-10">
        <h2
          id="metal-configurator-heading"
          className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl"
        >
          Metal Wall Panel Configurator
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base">
          Select a wall panel system, finish, and basic project information to see a budgetary
          estimate and request a formal quote.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Left: configuration controls */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="border-b border-gray-100 px-5 py-4 md:px-6">
              <p className="text-[13px] font-medium uppercase tracking-wider text-gray-500">
                Configuration
              </p>
              <p className="mt-0.5 text-[13px] text-gray-500">
                Panel system, material, finish, and project size.
              </p>
            </div>
            <div className="divide-y divide-gray-100 px-5 py-5 md:px-6 md:py-6">
              <div className="pb-6">
                <SystemPicker value={systemId} onChange={setSystemId} />
              </div>
              <div className="grid gap-6 py-6 sm:grid-cols-2">
                <MaterialPicker value={material} onChange={handleMaterialChange} />
                <GaugePicker material={material} value={gauge} onChange={setGauge} />
              </div>
              {requiresAttachment && (
                <div className="py-6">
                  <h3 className="text-sm font-medium text-gray-900">
                    Attachment Type
                  </h3>
                  <p className="mt-0.5 text-[13px] text-gray-500">
                    Select panel attachment configuration.
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:max-w-xs">
                    <button
                      type="button"
                      onClick={() => setAttachmentType("with_clips")}
                      className={`flex h-10 items-center justify-center rounded-lg border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
                        attachmentType === "with_clips"
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-200 bg-white text-gray-900 hover:border-gray-300"
                      }`}
                    >
                      With Clip
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttachmentType("without_clips")}
                      className={`flex h-10 items-center justify-center rounded-lg border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
                        attachmentType === "without_clips"
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-200 bg-white text-gray-900 hover:border-gray-300"
                      }`}
                    >
                      Without Clip
                    </button>
                  </div>
                </div>
              )}
              <div className="py-6">
                <PacCladColorSwatches value={colorId} onChange={setColorId} />
              </div>
              <div className="pt-6">
                <h3 className="text-sm font-medium text-gray-900">
                  Project size &amp; location
                </h3>
                <p className="mt-0.5 text-[13px] text-gray-500">
                  Approximate net wall area and optional location information.
                </p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <label className="sm:col-span-2">
                    <span className="block text-xs font-medium uppercase tracking-wide text-gray-600">
                      Total wall area (ft²)
                    </span>
                    <div className="mt-1.5 flex items-center gap-2">
                      <input
                        type="number"
                        min={10}
                        step={10}
                        value={totalSqFtInput}
                        onChange={(e) => setTotalSqFtInput(e.target.value)}
                        className="block h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                        placeholder="e.g. 1,500"
                      />
                    </div>
                  </label>
                  <label>
                    <span className="block text-xs font-medium uppercase tracking-wide text-gray-600">
                      State / region (optional)
                    </span>
                    <input
                      type="text"
                      value={projectState}
                      onChange={(e) => setProjectState(e.target.value)}
                      className="mt-1.5 block h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                      placeholder="State or province"
                    />
                  </label>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <label className="sm:col-span-1">
                    <span className="block text-xs font-medium uppercase tracking-wide text-gray-600">
                      Postal / ZIP (optional)
                    </span>
                    <input
                      type="text"
                      value={projectPostalCode}
                      onChange={(e) => setProjectPostalCode(e.target.value)}
                      className="mt-1.5 block h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                      placeholder="ZIP / postal code"
                    />
                  </label>
                  <div className="sm:col-span-2 flex items-end text-[12px] text-gray-500">
                    <p>
                      Use rounded values for early budgeting. We&apos;ll refine quantities and layout
                      as part of the final quote and submittal process.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: estimate summary card */}
        <div className="lg:col-span-5">
          <div className="space-y-4 lg:sticky lg:top-24">
            <MetalPriceSummary
              hasEstimate={hasEstimate}
              isQuoteOnly={isSpecialty}
              systemLabel={selectedSystem.label}
              totalSqFt={totalSqFt}
              pricePerSqFt={pricePerSqFt}
              materialSubtotal={materialSubtotal}
              laborSubtotal={laborSubtotal}
              attachmentLabel={
                systemId === "precision-series" && attachmentType
                  ? attachmentType === "with_clips"
                    ? "Attachment: With Clip"
                    : "Attachment: Without Clip"
                  : undefined
              }
            />
            <button
              type="button"
              onClick={handleRequestQuote}
              className="mt-1 w-full rounded-xl bg-gray-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!isSpecialty && !hasEstimate}
            >
              {isSpecialty ? "Upload Plans for Review" : "Request Final Quote"}
            </button>
            {!isSpecialty && (
              <p className="text-[11px] text-gray-500">
                Budgetary estimate only. Final quote, system detailing, and lead time will be confirmed
                after our team reviews your drawings and project information.
              </p>
            )}
            {isSpecialty && (
              <p className="text-[11px] text-gray-500">
                Specialty and custom systems are always handled through a project-specific consultation.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200/70 bg-gray-50/80 px-4 py-3 text-[12px] text-gray-600 sm:px-5">
        <p>
          This tool is intended for early budgeting only and does not replace formal engineering, takeoffs,
          or manufacturer coordination. Detailed pricing will be issued as part of a written quote once
          drawings and specifications are reviewed.
        </p>
      </div>
    </section>
  );
}

