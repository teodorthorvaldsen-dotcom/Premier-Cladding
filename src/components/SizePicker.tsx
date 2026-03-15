"use client";

import {
  CUSTOM_WIDTH_MAX_IN,
  maxLengthByThicknessMm,
  MIN_LENGTH_IN,
} from "@/data/acm";
import type { ThicknessId } from "@/data/acm";

export interface SizeSelection {
  widthId: string | null;
  widthIn: number;
  lengthIn: number;
}

interface SizePickerProps {
  value: SizeSelection;
  onChange: (s: SizeSelection) => void;
  thicknessId: ThicknessId;
}

function getMaxLengthIn(thicknessId: ThicknessId): number {
  const mm = Number(thicknessId.replace("mm", ""));
  return maxLengthByThicknessMm[mm] ?? 190;
}

function clampWidth(val: number): number {
  const n = Math.round(Number(val)) || MIN_LENGTH_IN;
  return Math.min(CUSTOM_WIDTH_MAX_IN, Math.max(MIN_LENGTH_IN, n));
}

export function SizePicker({ value, onChange, thicknessId }: SizePickerProps) {
  const maxLength = getMaxLengthIn(thicknessId);

  const clampLength = (val: number): number =>
    Math.min(maxLength, Math.max(MIN_LENGTH_IN, Math.round(Number(val)) || MIN_LENGTH_IN));

  const setWidth = (widthIn: number) => {
    onChange({
      widthId: "custom",
      widthIn: clampWidth(widthIn),
      lengthIn: clampLength(value.lengthIn),
    });
  };

  const setLength = (lengthIn: number) => {
    onChange({
      ...value,
      lengthIn: clampLength(lengthIn),
    });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900">Size</label>
      <p className="mt-0.5 text-xs text-gray-500">Width and length in inches. Max width 62 in, max length {Math.floor(maxLength / 12)} ft {maxLength % 12} in.</p>
      <div className="mt-3 space-y-4" role="group" aria-label="Panel width and length">
        <div>
          <label htmlFor="width-input" className="block text-xs font-medium text-gray-700">
            Width (in)
          </label>
          <input
            id="width-input"
            type="number"
            min={MIN_LENGTH_IN}
            max={CUSTOM_WIDTH_MAX_IN}
            value={value.widthIn}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="mt-1.5 block h-11 w-28 rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            aria-label="Width in inches"
          />
        </div>
        <div>
          <label htmlFor="length-input" className="block text-xs font-medium text-gray-700">
            Length (in)
          </label>
          <input
            id="length-input"
            type="number"
            min={MIN_LENGTH_IN}
            max={maxLength}
            value={value.lengthIn}
            onChange={(e) => setLength(Number(e.target.value))}
            className="mt-1.5 block h-11 w-28 rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            aria-label="Length in inches"
          />
        </div>
      </div>
    </div>
  );
}
