"use client";

import type { PanelType } from "@/lib/pricing";

interface PanelTypePickerProps {
  value: PanelType;
  onChange: (value: PanelType) => void;
  variant?: "acm" | "flashing";
}

const OPTIONS_BY_VARIANT: Record<
  NonNullable<PanelTypePickerProps["variant"]>,
  { value: PanelType; label: string; price: string; description?: string }[]
> = {
  acm: [
    { value: "basic", label: "Basic Rectangular with Extrusions", price: "$24/sq ft" },
    { value: "basic-no-extrusions", label: "Basic Rectangular without Extrusions", price: "$24/sq ft" },
    {
      value: "tray",
      label: "Custom Shape",
      price: "Estimate will come with final quote",
      description:
        "Required for complex cuts, returns, angles, or non-rectangular shapes. Non-square panels will need drawings.",
    },
  ],
  flashing: [
    { value: "basic", label: "Basic Rectangular", price: "$2/sq ft" },
    {
      value: "tray",
      label: "Custom Shape",
      price: "Estimate will come with final quote",
      description:
        "Required for complex cuts, bends, angles, or non-rectangular shapes. Non-square flashing will need drawings.",
    },
  ],
};

export function PanelTypePicker({ value, onChange, variant = "acm" }: PanelTypePickerProps) {
  const options = OPTIONS_BY_VARIANT[variant];
  const label = variant === "flashing" ? "Flashing type" : "Panel type";
  const colsClass = options.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3";
  return (
    <div>
      <label className="block text-sm font-medium text-gray-900">{label}</label>
      <div
        className={`mt-3 grid grid-cols-1 gap-4 ${colsClass}`}
        role="group"
        aria-label={label}
      >
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={value === opt.value}
            className={`flex flex-col items-start rounded-2xl border p-5 text-left transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
              value === opt.value
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <span className="text-[15px] font-medium">{opt.label}</span>
            <span className={`mt-1 text-[15px] font-semibold tabular-nums ${value === opt.value ? "text-white" : "text-gray-900"}`}>
              {opt.price}
            </span>
            {opt.description && (
              <span className={`mt-2 text-[14px] leading-relaxed ${value === opt.value ? "text-white/80" : "text-gray-500"}`}>
                {opt.description}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
