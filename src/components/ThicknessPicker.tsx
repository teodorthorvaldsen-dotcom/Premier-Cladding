"use client";

import { thicknesses, type ThicknessId } from "@/data/acm";

interface ThicknessPickerProps {
  value: ThicknessId;
  onChange: (id: ThicknessId) => void;
  variant?: "acm" | "flashing";
}

export function ThicknessPicker({ value, onChange, variant = "acm" }: ThicknessPickerProps) {
  const label = variant === "flashing" ? "Flashing thickness" : "Thickness";
  const hint = variant === "flashing" ? "Thickness shown in inches." : "Select panel thickness.";
  const aria = variant === "flashing" ? "Flashing thickness" : "Panel thickness";
  return (
    <div>
      <label className="block text-sm font-medium text-gray-900">{label}</label>
      <p className="mt-0.5 text-xs text-gray-500">{hint}</p>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={aria}>
        {thicknesses.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            aria-pressed={value === t.id}
            className={`h-11 rounded-xl border px-4 text-[15px] font-medium transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
              value === t.id
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            {variant === "flashing" ? '.039"' : t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
