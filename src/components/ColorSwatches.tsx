"use client";

import Image from "next/image";
import Link from "next/link";
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

/** Equal-width columns that shrink with the container — avoids max-content overflow beside the summary column. */
function gridColsClass(maxCols: number): string {
  const base = "w-full min-w-0 justify-items-center";
  if (maxCols >= 5) {
    return `${base} grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`;
  }
  if (maxCols === 4) {
    return `${base} grid-cols-2 md:grid-cols-3 lg:grid-cols-4`;
  }
  if (maxCols === 3) {
    return `${base} grid-cols-2 lg:grid-cols-3`;
  }
  if (maxCols === 2) {
    return `${base} grid-cols-2`;
  }
  return `${base} grid-cols-1`;
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
    <div className={"mt-4 grid gap-x-3 gap-y-5 " + gridColsClass(maxCols)} role="group">
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
    <div className="flex min-w-0 w-full max-w-[6.25rem] flex-col items-center gap-1.5 justify-self-center">
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
      <div className="w-full min-w-0 text-center">
        <p className="break-words text-[15px] font-semibold leading-snug text-gray-900 sm:text-xs">{c.name}</p>
        <p className="mt-0.5 text-[14px] font-normal tabular-nums text-gray-500 sm:text-[15px]">{c.code}</p>
        {coatLabel && (
          <p className="mt-0.5 text-[9px] font-normal capitalize leading-tight text-gray-400">{coatLabel}</p>
        )}
      </div>
    </div>
  );
}

function SeriesHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b-2 border-blue-900/45 pb-3">
      <h3 className="text-base font-bold uppercase tracking-[0.06em] text-blue-900 sm:text-lg sm:tracking-[0.07em]">
        {title}
      </h3>
      {subtitle ? <p className="mt-2 text-[15px] leading-relaxed text-gray-500 sm:text-sm">{subtitle}</p> : null}
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
    <div className="min-w-0">
      <label className="block text-sm font-medium text-gray-900">Color &amp; Finish</label>
      <p className="mt-0.5 text-[15px] text-gray-500">
        Select a standard Alfrex FR finish or custom color match. Series below follow the standard finishes catalog.
      </p>

      <div className="mt-8 space-y-10" role="region" aria-label="Panel color series">
        <section>
          <h3 className="text-sm font-medium text-gray-900">Order color swatches</h3>
          <p className="mt-0.5 text-[15px] text-gray-500">
            Request physical finish samples to review color and appearance under your lighting before you order panels.{" "}
            <Link
              href="/#questions-contact"
              className="font-medium text-blue-900 underline decoration-blue-900/30 underline-offset-2 hover:text-blue-950"
            >
              Contact us
            </Link>{" "}
            with the finish names or JY codes you need and your ship-to address; we will confirm availability and how
            samples are provided.
          </p>
        </section>

        <section>
          <SeriesHeader
            title="2 coat solids"
            subtitle="30 Year Finish Warranty"
          />
          <SwatchGrid colorIds={twoCoatSolidColorIds} maxCols={5} value={value} onChange={onChange} />
        </section>

        <section>
          <SeriesHeader
            title="Vivid solids*"
            subtitle="20 Year Limited Finish Warranty"
          />
          <SwatchGrid colorIds={vividSolidColorIds} maxCols={5} value={value} onChange={onChange} />
        </section>

        <section>
          <SeriesHeader
            title="2 coat micas"
            subtitle="30 Year Finish Warranty. Micaceous finishes can appear directional under different viewing angles and lighting."
          />
          <SwatchGrid colorIds={twoCoatMicaColorIds} maxCols={5} value={value} onChange={onChange} />
        </section>

        <section>
          <SeriesHeader
            title="3 coat metallics"
            subtitle="30 Year Finish Warranty"
          />
          <SwatchGrid colorIds={threeCoatMetallicColorIds} maxCols={5} value={value} onChange={onChange} />
        </section>

        <section>
          <SeriesHeader
            title="Metal series"
            subtitle="20 Year Finish Warranty"
          />
          <SwatchGrid colorIds={metalSeriesColorIds} maxCols={4} value={value} onChange={onChange} />
        </section>

        <section>
          <SeriesHeader
            title="Wood series"
            subtitle="20 Year Finish Warranty"
          />
          <SwatchGrid colorIds={woodSeriesColorIds} maxCols={3} value={value} onChange={onChange} />
        </section>

        <section>
          <SeriesHeader title="Natural zinc series*" />
          <p className="mb-3 text-[15px] italic leading-relaxed text-gray-500">
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
          <p className="mt-2 text-[15px] leading-relaxed text-gray-500 sm:text-xs">
            To begin the custom color match process, send a physical sample (preferred), a coating manufacturer paint
            code, or a reference such as a Pantone number, with your performance requirements. Perfect matches are not
            always possible due to substrate, paint system, and process differences — contact us for specifics.
          </p>
          <div className="mt-4">
            <SwatchGrid colorIds={["custom-color-match"]} maxCols={1} value={value} onChange={onChange} />
          </div>
          {value === "custom-color-match" && (
            <div className="mt-5 max-w-lg space-y-4 rounded-xl border border-gray-200/90 bg-gray-50/80 p-4 sm:p-5">
              <div>
                <label htmlFor="custom-color-reference" className="block text-[15px] font-medium text-gray-900">
                  Paint code or color reference
                </label>
                <p className="mt-0.5 text-[15px] text-gray-500">
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
                <span className="block text-[15px] font-medium text-gray-900">Color specification (PDF)</span>
                <p className="mt-0.5 text-[15px] text-gray-500">
                  Upload a cutsheet or submittal if you have one (PDF only).
                </p>
                <label className="mt-2 flex cursor-pointer flex-col gap-2 sm:flex-row sm:items-center">
                  <span className="inline-flex w-fit rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[15px] font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 focus-within:ring-2 focus-within:ring-gray-400 focus-within:ring-offset-2">
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
                    <span className="flex min-w-0 flex-1 items-center gap-2 text-[14px] text-gray-600">
                      <span className="truncate" title={customColorSpecFile.name}>
                        {customColorSpecFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => onCustomColorSpecFileChange(null)}
                        className="shrink-0 text-blue-900 hover:text-blue-950 focus:outline-none focus:underline"
                      >
                        Remove
                      </button>
                    </span>
                  ) : (
                    <span className="text-[14px] text-gray-400">No file selected</span>
                  )}
                </label>
              </div>
            </div>
          )}
        </section>
      </div>

      <p className="mt-8 text-[15px] leading-relaxed text-gray-400">
        On-screen swatches are approximations. Final color varies by lighting, viewing angle, and production lot.
      </p>

      {selectedColor && (
        <p className="mt-2 text-[15px] text-gray-500">
          <span className="font-medium text-gray-700">Selected:</span>{" "}
          <span className="font-medium text-gray-900">{selectedColor.name}</span> ({selectedColor.code})
          {selectedColor.availability === "Made to Order" ? (
            <span className="block text-[14px] text-amber-800/90">Made to order — lead time confirmed on quote.</span>
          ) : null}
        </p>
      )}
    </div>
  );
}
