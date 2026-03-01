"use client";

import { useMemo, useState } from "react";
import { colorCategoryList, colors, type ColorCategory, type ColorId } from "@/data/acm";

interface ColorSwatchesProps {
  value: ColorId;
  onChange: (id: ColorId) => void;
}

export function ColorSwatches({ value, onChange }: ColorSwatchesProps) {
  const [categoryFilter, setCategoryFilter] = useState<ColorCategory | "All">("All");
  const [search, setSearch] = useState("");

  const filteredColors = useMemo(() => {
    let list = categoryFilter === "All" ? colors : colors.filter((c) => c.category === categoryFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q)
      );
    }
    return list;
  }, [categoryFilter, search]);

  const colorsByCategory = useMemo(() => {
    const map = new Map<ColorCategory, (typeof colors)[number][]>();
    for (const c of filteredColors) {
      const arr = map.get(c.category) ?? [];
      arr.push(c);
      map.set(c.category, arr);
    }
    return colorCategoryList.filter((cat) => map.has(cat)).map((cat) => ({ category: cat, items: map.get(cat)! }));
  }, [filteredColors]);

  const selectedColor = colors.find((c) => c.id === value);

  type ColorItem = (typeof colors)[number];
  type SwatchStyleInput = { swatchHex?: string; hex?: string; swatchImage?: string };

  function getSwatchStyle(c: ColorItem) {
    const row = c as SwatchStyleInput;
    const hex = row.swatchHex ?? row.hex ?? "#ccc";
    if (typeof row.swatchImage === "string") {
      return {
        backgroundImage: `url(${row.swatchImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: hex,
      };
    }
    return { backgroundColor: hex };
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900">Color & Finish</label>
      <p className="mt-0.5 text-[13px] text-gray-500">Choose a finish and color from the palette.</p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search colors…"
          className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 text-[15px] placeholder:text-gray-400 focus:border-gray-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-300 sm:max-w-[11rem]"
          aria-label="Search colors"
        />
        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter((e.target.value === "All" ? "All" : e.target.value) as ColorCategory | "All")
          }
          className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 text-[15px] focus:border-gray-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-300 sm:w-auto sm:min-w-[9rem]"
          aria-label="Filter by category"
        >
          <option value="All">All</option>
          {colorCategoryList.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div role="group" aria-label="Panel color" className="mt-5 space-y-8">
        {colorsByCategory.map(({ category, items }) => (
          <div key={category}>
            <h4 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-gray-500">
              {category}
            </h4>
            <div className="grid grid-cols-6 gap-3 sm:grid-cols-7 md:grid-cols-8 lg:grid-cols-9">
              {items.map((c) => {
                const isSelected = value === c.id;
                return (
                  <div key={c.id} className="group relative flex justify-center">
                    <button
                      type="button"
                      onClick={() => onChange(c.id)}
                      aria-pressed={isSelected}
                      aria-label={`${c.name} (${c.code})`}
                      title={`${c.name} (${c.code})`}
                      className={`relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 sm:h-14 sm:w-14 ${
                        isSelected
                          ? "ring-2 ring-gray-900 ring-offset-2"
                          : "ring-1 ring-gray-200/80 ring-inset hover:ring-gray-300"
                      }`}
                      style={getSwatchStyle(c)}
                    >
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
        ))}
      </div>

      {filteredColors.length === 0 && (
        <p className="mt-5 text-[13px] text-gray-500">No colors match your search.</p>
      )}

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
