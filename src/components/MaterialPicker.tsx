"use client";

import type { FC } from "react";

export type MetalMaterialId = "steel" | "aluminum";

interface MaterialPickerProps {
  value: MetalMaterialId;
  onChange: (id: MetalMaterialId) => void;
}

export const MaterialPicker: FC<MaterialPickerProps> = ({ value, onChange }) => {
  return (
    <section aria-labelledby="metal-material-heading">
      <h3
        id="metal-material-heading"
        className="text-sm font-medium text-gray-900"
      >
        Material
      </h3>
      <p className="mt-0.5 text-[13px] text-gray-500">
        Select the primary panel substrate for this project.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange("steel")}
          className={`flex h-10 items-center justify-center rounded-lg border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
            value === "steel"
              ? "border-gray-900 bg-gray-900 text-white"
              : "border-gray-200 bg-white text-gray-900 hover:border-gray-300"
          }`}
        >
          Steel
        </button>
        <button
          type="button"
          onClick={() => onChange("aluminum")}
          className={`flex h-10 items-center justify-center rounded-lg border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
            value === "aluminum"
              ? "border-gray-900 bg-gray-900 text-white"
              : "border-gray-200 bg-white text-gray-900 hover:border-gray-300"
          }`}
        >
          Aluminum
        </button>
      </div>
    </section>
  );
};

