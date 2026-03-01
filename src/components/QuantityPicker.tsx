"use client";

interface QuantityPickerProps {
  value: number;
  onChange: (n: number) => void;
  min?: number;
}

const MIN = 1;

export function QuantityPicker({ value, onChange, min = MIN }: QuantityPickerProps) {
  const num = Math.max(min, Math.floor(value) || min);

  return (
    <div>
      <label htmlFor="quantity-input" className="block text-sm font-medium text-gray-900">
        Quantity
      </label>
      <p className="mt-0.5 text-xs text-gray-500">Number of panels.</p>
      <div className="mt-3 flex items-center gap-3" role="group" aria-label="Panel quantity">
        <input
          id="quantity-input"
          type="number"
          min={min}
          value={num}
          onChange={(e) => onChange(Math.max(min, Math.floor(Number(e.target.value)) || min))}
            className="h-11 w-24 rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          aria-describedby="quantity-helper"
        />
        <span id="quantity-helper" className="text-sm text-gray-600">panels</span>
      </div>
    </div>
  );
}
