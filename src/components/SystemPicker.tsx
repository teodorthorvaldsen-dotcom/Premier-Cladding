"use client";

import type { FC } from "react";

export type MetalSystemId =
  | "flush-reveal"
  | "board-batten"
  | "precision-series"
  | "exposed-fastener"
  | "specialty-custom";

export interface MetalSystemOption {
  id: MetalSystemId;
  label: string;
  description: string;
  fastenerType: "concealed" | "exposed";
}

export const METAL_SYSTEM_OPTIONS: MetalSystemOption[] = [
  {
    id: "flush-reveal",
    label: "Flush & Reveal (concealed)",
    description: "Flat and reveal joint panels for clean, planar façades and refined shadow lines.",
    fastenerType: "concealed",
  },
  {
    id: "board-batten",
    label: "Board & Batten (concealed)",
    description: "Vertical profiles that reinterpret traditional board and batten in metal.",
    fastenerType: "concealed",
  },
  {
    id: "precision-series",
    label: "Precision Series (concealed)",
    description: "Deeper profiled wall panels for pronounced articulation and shadowing.",
    fastenerType: "concealed",
  },
  {
    id: "exposed-fastener",
    label: "Exposed Fastener / Ribbed",
    description: "Ribbed and corrugated panels where exposed fasteners are part of the aesthetic.",
    fastenerType: "exposed",
  },
  {
    id: "specialty-custom",
    label: "Specialty / Custom (quote only)",
    description: "Project-specific profiles, perforations, and custom detailing developed with our team.",
    fastenerType: "concealed",
  },
];

interface SystemPickerProps {
  value: MetalSystemId;
  onChange: (id: MetalSystemId) => void;
}

export const SystemPicker: FC<SystemPickerProps> = ({ value, onChange }) => {
  return (
    <section aria-labelledby="metal-system-heading">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h3
            id="metal-system-heading"
            className="text-sm font-medium text-gray-900"
          >
            Panel system / profile
          </h3>
          <p className="mt-0.5 text-[13px] text-gray-500">
            Choose the primary wall panel system for this project.
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {METAL_SYSTEM_OPTIONS.map((option) => {
          const isSelected = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`flex h-full flex-col items-start rounded-xl border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
                isSelected
                  ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <span className="text-[13px] font-medium uppercase tracking-wide text-gray-500">
                {option.fastenerType === "concealed" ? "Concealed fastener" : "Exposed fastener"}
              </span>
              <span
                className={`mt-1 text-sm font-semibold ${
                  isSelected ? "text-white" : "text-gray-900"
                }`}
              >
                {option.label}
              </span>
              <span
                className={`mt-1 text-[13px] leading-relaxed ${
                  isSelected ? "text-gray-100/90" : "text-gray-600"
                }`}
              >
                {option.description}
              </span>
              {option.id === "specialty-custom" && (
                <span className={`mt-2 text-[11px] font-medium uppercase tracking-wide ${
                  isSelected ? "text-amber-200" : "text-amber-700"
                }`}>
                  Quote only – no instant pricing
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};

