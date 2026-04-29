"use client";

import { useEffect, useState } from "react";

interface QuantityPickerProps {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  unitLabel?: string;
}

const MIN = 1;

export function QuantityPicker({
  value,
  onChange,
  min = MIN,
  unitLabel = "panels",
}: QuantityPickerProps) {
  const normalized = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
  const [draft, setDraft] = useState<string>(String(normalized));

  useEffect(() => {
    // Keep the input in sync when value changes externally.
    setDraft(String(normalized));
  }, [normalized]);

  const commit = (raw: string) => {
    const next = Math.max(0, Math.floor(Number(raw) || 0));
    setDraft(String(next));
    onChange(next < min ? min : next);
  };

  return (
    <div>
      <label htmlFor="quantity-input" className="block text-sm font-medium text-gray-900">
        Quantity
      </label>
      <p className="mt-0.5 text-xs text-gray-500">Number of {unitLabel}.</p>
      <div className="mt-3 flex items-center gap-3" role="group" aria-label={`${unitLabel} quantity`}>
        <input
          id="quantity-input"
          type="number"
          min={0}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commit((e.target as HTMLInputElement).value);
              (e.target as HTMLInputElement).blur();
            }
          }}
          className="h-11 w-24 rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          aria-describedby="quantity-helper"
        />
        <span id="quantity-helper" className="text-sm text-gray-600">{unitLabel}</span>
      </div>
    </div>
  );
}
