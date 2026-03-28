"use client";

import Image from "next/image";
import { colors, type ColorId } from "@/data/acm";

interface ColorSwatchesProps {
  value: ColorId;
  onChange: (id: ColorId) => void;
}

export function ColorSwatches({ value, onChange }: ColorSwatchesProps) {
  const selectedColor = colors.find((c) => c.id === value);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900">Color &amp; Finish</label>
      <p className="mt-0.5 text-[13px] text-gray-500">Select a finish/color from the palette.</p>

      <div role="group" aria-label="Panel color" className="mt-5">
        <div className="grid grid-cols-6 gap-3 sm:grid-cols-7 md:grid-cols-8 lg:grid-cols-9 xl:grid-cols-10">
          {colors.map((c) => {
            const isSelected = value === c.id;
            const hex = c.swatchHex ?? "#ccc";
            const swatchImage = (c as unknown as { swatchImage?: string }).swatchImage;

            return (
              <div key={c.id} className="group relative flex justify-center">
                <button
                  type="button"
                  onClick={() => onChange(c.id)}
                  aria-pressed={isSelected}
                  aria-label={`${c.name} (${c.code})`}
                  title={`${c.name} (${c.code})`}
                  className={`relative flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 sm:h-14 sm:w-14 ${
                    isSelected
                      ? "ring-2 ring-gray-900 ring-offset-2"
                      : "ring-1 ring-gray-200/80 ring-inset hover:ring-gray-300"
                  }`}
                >
                  <span
                    className="absolute inset-0"
                    style={{
                      backgroundColor: hex,
                    }}
                  />
                  {typeof swatchImage === "string" && (
                    <Image
                      src={swatchImage}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="56px"
                      draggable={false}
                      aria-hidden
                    />
                  )}

                  {isSelected && (
                    <span
                      className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/15"
                      aria-hidden
                    >
                      <svg
                        className="h-5 w-5 text-white drop-shadow-sm sm:h-6 sm:w-6"
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

                <span
                  className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-800/90 px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-sm backdrop-blur-sm transition group-hover:opacity-100 group-focus-within:opacity-100"
                  role="tooltip"
                >
                  {c.name} ({c.code})
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-gray-400">
        Swatches are digital approximations. Final color may vary by screen and production run.
      </p>

      {selectedColor && (
        <p className="mt-2 text-[13px] text-gray-500">
          <span className="font-medium text-gray-700">{selectedColor.name}</span> ({selectedColor.code})
        </p>
      )}
    </div>
  );
}
