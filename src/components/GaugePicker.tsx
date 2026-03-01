"use client";

import type { FC } from "react";
import type { MetalMaterialId } from "./MaterialPicker";

export type GaugeId = "22 ga" | "24 ga" | "0.040" | "0.050";

interface GaugePickerProps {
  material: MetalMaterialId;
  value: GaugeId;
  onChange: (id: GaugeId) => void;
}

export const GaugePicker: FC<GaugePickerProps> = ({ material, value, onChange }) => {
  const steelOptions: GaugeId[] = ["22 ga", "24 ga"];
  const aluminumOptions: GaugeId[] = ["0.040", "0.050"];
  const options = material === "steel" ? steelOptions : aluminumOptions;

  return (
    <section aria-labelledby="metal-gauge-heading">
      <h3
        id="metal-gauge-heading"
        className="text-sm font-medium text-gray-900"
      >
        Gauge / thickness
      </h3>
      <p className="mt-0.5 text-[13px] text-gray-500">
        Typical gauges and thicknesses for architectural wall panels.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:max-w-xs">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`flex h-10 items-center justify-center rounded-lg border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
              value === opt
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-900 hover:border-gray-300"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </section>
  );
};

