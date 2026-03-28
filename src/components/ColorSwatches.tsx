"use client";

import Image from "next/image";
import {
  colors,
  naturalZincColorIds,
  specialtyFinishColorIds,
  threeCoatMetallicColorIds,
  twoCoatMicaColorIds,
  twoCoatSolidColorIds,
  type ColorId,
  vividSolidColorIds,
  metalSeriesColorIds,
  woodSeriesColorIds,
} from "@/data/acm";

interface ColorSwatchesProps {
  value: ColorId;
  onChange: (id: ColorId) => void;
  customColorReference: string;
  onCustomColorReferenceChange: (value: string) => void;
  customColorSpecFile: File | null;
  onCustomColorSpecFileChange: (file: File | null) => void;
}

type ColorRow = (typeof colors)[number];

function colorById(id: string): ColorRow | undefined {
  return colors.find((c) => c.id === id);
}

function gridColsClass(maxCols: number): string {
  if (maxCols >= 5) {
    return "[grid-template-columns:repeat(2,max-content)] sm:[grid-template-columns:repeat(3,max-content)] md:[grid-template-columns:repeat(4,max-content)] lg:[grid-template-columns:repeat(5,max-content)]";
  }
  if (maxCols === 4) {
    return "[grid-template-columns:repeat(2,max-content)] sm:[grid-template-columns:repeat(2,max-content)] md:[grid-template-columns:repeat(3,max-content)] lg:[grid-template-columns:repeat(4,max-content)]";
  }
  if (maxCols === 3) {
    return "[grid-template-columns:repeat(2,max-content)] sm:[grid-template-columns:repeat(3,max-content)]";
  }
  if (maxCols === 2) {
    return "[grid-template-columns:repeat(2,max-content)]";
  }
  return "[grid-template-columns:repeat(1,max-content)]";
}

function SwatchGrid({
  colorIds,
  maxCols,
  value,
  onChange,
}: {
  colorIds: readonly string[];
  maxCols: number;
  value: ColorId;
  onChange: (id: ColorId) => void;
}) {
  return (
    <div
      className={"mt-4 grid gap-x-4 gap-y-5 justify-start " + gridColsClass(maxCols)}
      role="group"
    >
      {colorIds.map((id) => {
        const c = colorById(id);
        if (!c) return null;
        return (
          <SwatchCell key={id} color={c} selected={value === c.id} onSelect={() => onChange(c.id)} />
        );
      })}
    </div>
  );
}

function SwatchCell({
  color: c,
  selected,
  onSelect,
}: {
  color: ColorRow;
  selected: boolean;
  onSelect: () => void;
}) {
  const hex = c.swatchHex ?? "#ccc";
  const swatchImage =
    "swatchImage" in c && typeof (c as { swatchImage?: string }).swatchImage === "string"
      ? (c as { swatchImage: string }).swatchImage
      : undefined;
  const coatLabel =
    "coatSystemLabel" in c && typeof (c as { coatSystemLabel?: string }).coatSystemLabel === "string"
      ? (c as { coatSystemLabel: string }).coatSystemLabel
      : undefined;

  return (
    <div className="flex w-[5.75rem] flex-col items-center gap-1.5 sm:w-[6.25rem]">
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`${c.name} (${c.code})`}
        title={`${c.name} (${c.code})`}
        className={`relative flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 sm:h-[3.25rem] sm:w-[3.25rem] ${
          selected
            ? "ring-2 ring-gray-900 ring-offset-2"
            : "ring-1 ring-gray-200/80 ring-inset hover:ring-gray-300"
        }`}
      >
        <span className="absolute inset-0" style={{ backgroundColor: hex }} />
        {swatchImage && (
          <Image
            src={swatchImage}
            alt=""
            fill
            className="object-cover"
            sizes="52px"
            draggable={false}
            aria-hidden
          />
        )}
        {selected && (
          <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/15" aria-hidden>
            <svg
              className="h-5 w-5 text-white drop-shadow-sm sm:h-5 sm:w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        )}
      </button>
      <div className="w-full text-center">
        <p className="text-[11px] font-semibold leading-snug text-gray-900 sm:text-xs">{c.name}</p>
        <p className="mt-0.5 text-[10px] font-normal tabular-nums text-gray-500 sm:text-[11px]">{c.code}</p>
        {coatLabel && (
          <p className="mt-0.5 text-[9px] font-normal capitalize leading-tight text-gray-400">{coatLabel}</p>
        )}
      </div>
    </div>
  );
}

function SeriesHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-red-600/35 pb-2">
      <h3 className="text-[13px] font-bold uppercase tracking-wide text-red-600">{title}</h3>
      {subtitle ? <p className="mt-1.5 text-[11px] leading-relaxed text-gray-500 sm:text-xs">{subtitle}</p> : null}
    </div>
  );
}

export function ColorSwatches({
  value,
  onChange,
  customColorReference,
  onCustomColorReferenceChange,
  customColorSpecFile,
  onCustomColorSpecFileChange,
}: ColorSwatchesProps) {
  const selectedColor = colors.find((c) => c.id === value);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900">Color &amp; Finish</label>
      <p className="mt-0.5 text-[13px] text-gray-500">
        Select a standard Alfrex FR finish or custom color match. Series below follow the standard finishes catalog
        (F-01).
      </p>

      <div className="mt-8 space-y-10" role="region" aria-label="Panel color series">
        <section>
          <SeriesHeader
            title="2 coat solids"
            subtitle="30 Year Finish Warranty · AAMA 2605 · Matching 0.040″ flat sheet in inventory"
          />
          <SwatchGrid colorIds={twoCoatSolidColorIds} maxCols={5} value={value} onChange={onChange} />
        </section>

        <section>
          <SeriesHeader
            title="Vivid solids*"
            subtitle="20 Year Limited Finish Warranty · AAMA 2605 · Matching 0.040″ flat sheet in inventory"
          />
          <SwatchGrid colorIds={vividSolidColorIds} maxCols={5} value={value} onChange={onChange} />
        </section>

        <section>
          <SeriesHeader
            title="2 coat micas"
            subtitle="30 Year Finish Warranty · AAMA 2605 · Matching 0.040″ flat sheet in inventory. Micaceous finishes can appear directional under different viewing angles and lighting."
          />
          <SwatchGrid colorIds={twoCoatMicaColorIds} maxCols={5} value={value} onChange={onChange} />
        </section>

        <section>
          <SeriesHeader
            title="3 coat metallics"
            subtitle="30 Year Finish Warranty · AAMA 2605 · Matching 0.040″ flat sheet in inventory"
          />
          <SwatchGrid colorIds={threeCoatMetallicColorIds} maxCols={5} value={value} onChange={onChange} />
        </section>

        <section>
          <SeriesHeader
            title="Metal series"
            subtitle="20 Year Finish Warranty · AAMA 2605 · Matching 0.040″ flat sheet in inventory"
          />
          <SwatchGrid colorIds={metalSeriesColorIds} maxCols={4} value={value} onChange={onChange} />
        </section>

        <section>
          <SeriesHeader
            title="Wood series"
            subtitle="20 Year Finish Warranty · AAMA 2605 · Matching 0.040″ flat sheet in inventory"
          />
          <SwatchGrid colorIds={woodSeriesColorIds} maxCols={3} value={value} onChange={onChange} />
        </section>

        <section>
          <SeriesHeader title="Natural zinc series*" />
          <p className="mb-3 text-[11px] italic leading-relaxed text-gray-500">
            *Non-stocking item subject to minimum quantities. Bond integrity warranty only.
          </p>
          <SwatchGrid colorIds={naturalZincColorIds} maxCols={2} value={value} onChange={onChange} />
        </section>

        <section>
          <SeriesHeader
            title="Specialty series*"
            subtitle="Non-stocking / made to order — confirm availability and lead time with your quote."
          />
          <SwatchGrid colorIds={specialtyFinishColorIds} maxCols={2} value={value} onChange={onChange} />
        </section>

        <section>
          <SeriesHeader title="Custom colors" />
          <p className="mt-2 text-[11px] leading-relaxed text-gray-500 sm:text-xs">
            Matching custom colors is part of our everyday business. To begin, send a physical sample (preferred), a
            coating manufacturer paint code, or a reference such as a Pantone number, with your performance
            requirements. Matching 0.040″ flat sheet can often be coated with coil for MCM or plate, subject to minimums.
            Perfect matches are not always possible due to substrate, paint system, and process differences — contact us
            for specifics.
          </p>
          <div className="mt-4">
            <SwatchGrid colorIds={["custom-color-match"]} maxCols={1} value={value} onChange={onChange} />
          </div>
          {value === "custom-color-match" && (
            <div className="mt-5 max-w-lg space-y-4 rounded-xl border border-gray-200/90 bg-gray-50/80 p-4 sm:p-5">
              <div>
                <label htmlFor="custom-color-reference" className="block text-[13px] font-medium text-gray-900">
                  Paint code or color reference
                </label>
                <p className="mt-0.5 text-[11px] text-gray-500">
                  Manufacturer paint code, Pantone number, or other standard reference (optional but helpful).
                </p>
                <textarea
                  id="custom-color-reference"
                  value={customColorReference}
                  onChange={(e) => onCustomColorReferenceChange(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="e.g. Pantone 18-1033 TCX, Sherwin-Williams SW 6258, RAL 7016…"
                  className="mt-2 w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[14px] text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                />
              </div>
              <div>
                <span className="block text-[13px] font-medium text-gray-900">Color specification (PDF)</span>
                <p className="mt-0.5 text-[11px] text-gray-500">
                  Upload a cutsheet or submittal if you have one (PDF only).
                </p>
                <label className="mt-2 flex cursor-pointer flex-col gap-2 sm:flex-row sm:items-center">
                  <span className="inline-flex w-fit rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 focus-within:ring-2 focus-within:ring-gray-400 focus-within:ring-offset-2">
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        if (!f) {
                          onCustomColorSpecFileChange(null);
                          e.target.value = "";
                          return;
                        }
                        const ok =
                          f.type === "application/pdf" ||
                          f.name.toLowerCase().endsWith(".pdf");
                        if (!ok) {
                          onCustomColorSpecFileChange(null);
                          e.target.value = "";
                          return;
                        }
                        onCustomColorSpecFileChange(f);
                        e.target.value = "";
                      }}
                    />
                    Choose PDF
                  </span>
                  {customColorSpecFile ? (
                    <span className="flex min-w-0 flex-1 items-center gap-2 text-[12px] text-gray-600">
                      <span className="truncate" title={customColorSpecFile.name}>
                        {customColorSpecFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => onCustomColorSpecFileChange(null)}
                        className="shrink-0 text-red-600 hover:text-red-700 focus:outline-none focus:underline"
                      >
                        Remove
                      </button>
                    </span>
                  ) : (
                    <span className="text-[12px] text-gray-400">No file selected</span>
                  )}
                </label>
              </div>
            </div>
          )}
        </section>
      </div>

      <p className="mt-8 text-[11px] leading-relaxed text-gray-400">
        On-screen swatches are approximations. Final color varies by lighting, viewing angle, and production lot.
      </p>

      {selectedColor && (
        <p className="mt-2 text-[13px] text-gray-500">
          <span className="font-medium text-gray-700">Selected:</span>{" "}
          <span className="font-medium text-gray-900">{selectedColor.name}</span> ({selectedColor.code})
          {selectedColor.availability === "Made to Order" ? (
            <span className="block text-[12px] text-amber-800/90">Made to order — lead time confirmed on quote.</span>
          ) : null}
        </p>
      )}
    </div>
  );
}
