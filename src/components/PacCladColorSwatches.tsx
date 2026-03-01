"use client";

import { useMemo, useState } from "react";
import {
  pacCladColors,
  pacCladFinishTypes,
  type PacCladColor,
  type PacCladColorId,
  type PacCladFinishType,
} from "@/data/pacCladColors";

interface PacCladColorSwatchesProps {
  value: PacCladColorId;
  onChange: (id: PacCladColorId) => void;
}

type FinishFilter = PacCladFinishType | "All";

export function PacCladColorSwatches({ value, onChange }: PacCladColorSwatchesProps) {
  const [finishFilter, setFinishFilter] = useState<FinishFilter>("All");
  const [search, setSearch] = useState("");

  const filteredColors = useMemo(() => {
    let list = pacCladColors;
    if (finishFilter !== "All") {
      list = list.filter((c) => c.finishType === finishFilter);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q)
      );
    }
    return list;
  }, [finishFilter, search]);

  const selectedColor = pacCladColors.find((c) => c.id === value);

  type SwatchStyleInput = Pick<PacCladColor, "swatchHex" | "swatchImage">;

  function getSwatchStyle(c: SwatchStyleInput) {
    const hex = c.swatchHex ?? "#CCCCCC";
    if (typeof c.swatchImage === "string") {
      return {
        backgroundImage: `url(${c.swatchImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: hex,
      };
    }
    return { backgroundColor: hex };
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900">
        Color &amp; finish (PAC-CLAD)
      </label>
      <p className="mt-0.5 text-[13px] text-gray-500">
        Choose a PAC-CLAD color and finish family for this system.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search colors by name or code…"
          className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 text-[15px] placeholder:text-gray-400 focus:border-gray-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-300 sm:max-w-xs"
          aria-label="Search PAC-CLAD colors"
        />
        <select
          value={finishFilter}
          onChange={(e) =>
            setFinishFilter(
              e.target.value === "All" ? "All" : (e.target.value as PacCladFinishType)
            )
          }
          className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 text-[15px] focus:border-gray-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-300 sm:w-auto sm:min-w-[9rem]"
          aria-label="Filter by finish type"
        >
          <option value="All">All finish types</option>
          {pacCladFinishTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {filteredColors.map((c) => {
            const isSelected = c.id === value;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onChange(c.id)}
                aria-pressed={isSelected}
                className={`group flex flex-col items-stretch rounded-xl border bg-white p-1.5 text-left text-[11px] transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
                  isSelected
                    ? "border-gray-900 shadow-sm"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div
                  className={`mb-1 h-10 w-full rounded-lg border border-gray-200/70 ${isSelected ? "ring-1 ring-gray-900" : ""}`}
                  style={getSwatchStyle(c)}
                  aria-hidden
                />
                <span className="line-clamp-2 font-medium text-gray-900">
                  {c.name}
                </span>
                <span className="mt-0.5 line-clamp-2 text-[10px] text-gray-500">
                  {c.code}
                </span>
              </button>
            );
          })}
        </div>

        {filteredColors.length === 0 && (
          <p className="mt-4 text-[13px] text-gray-500">
            No PAC-CLAD colors match your search or filters.
          </p>
        )}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-gray-400">
        Colors shown are representative. Final color/availability confirmed with your final quote.
      </p>

      {selectedColor && (
        <p className="mt-2 text-[13px] text-gray-600">
          <span className="font-medium text-gray-800">{selectedColor.name}</span>{" "}
          ({selectedColor.code})
        </p>
      )}
    </div>
  );
}

