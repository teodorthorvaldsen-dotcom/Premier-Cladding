"use client";

import { finishes, type FinishId } from "@/data/acm";

interface FinishPickerProps {
  value: FinishId;
  onChange: (id: FinishId) => void;
}

export function FinishPicker({ value, onChange }: FinishPickerProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-2">Finish</h3>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Panel finish">
        {finishes.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onChange(f.id)}
            aria-pressed={value === f.id}
            className={`rounded-md border px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 ${
              value === f.id
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
