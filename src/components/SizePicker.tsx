"use client";

import {
  allWidths,
  CUSTOM_WIDTH_MAX_IN,
  CUSTOM_WIDTH_MIN_IN,
  maxLengthByThicknessMm,
  MIN_LENGTH_IN,
} from "@/data/acm";
import type { ThicknessId } from "@/data/acm";

const CUSTOM_WIDTH_ID = "custom";

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
  return maxLengthByThicknessMm[mm] ?? 300;
}

function clampWidth(val: number): number {
  return Math.min(
    CUSTOM_WIDTH_MAX_IN,
    Math.max(CUSTOM_WIDTH_MIN_IN, Math.round(Number(val)) || CUSTOM_WIDTH_MIN_IN)
  );
}

export function SizePicker({ value, onChange, thicknessId }: SizePickerProps) {
  const maxLength = getMaxLengthIn(thicknessId);
  const minLength = MIN_LENGTH_IN;
  const isCustomWidth = value.widthId === CUSTOM_WIDTH_ID;

  const clampLength = (val: number): number =>
    Math.min(maxLength, Math.max(minLength, Math.round(Number(val)) || minLength));

  const setWidth = (id: string, widthIn: number) => {
    onChange({
      widthId: id,
      widthIn,
      lengthIn: clampLength(value.lengthIn),
    });
  };

  const setCustomWidth = (widthIn: number) => {
    onChange({
      widthId: CUSTOM_WIDTH_ID,
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
      <p className="mt-0.5 text-xs text-gray-500">Width and length in inches.</p>
      <div className="mt-3 space-y-4" role="group" aria-label="Panel width and length">
        <div>
          <span className="block text-xs font-medium text-gray-700">Width</span>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {allWidths.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setWidth(w.id, w.widthIn)}
                aria-pressed={value.widthId === w.id}
                className={`h-11 rounded-xl border px-4 text-[15px] font-medium transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
                  value.widthId === w.id
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {w.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCustomWidth(value.widthIn)}
              aria-pressed={isCustomWidth}
              className={`h-11 rounded-xl border px-4 text-[15px] font-medium transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
                isCustomWidth
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              Custom width
            </button>
          </div>
          {isCustomWidth && (
            <div className="mt-3">
              <label htmlFor="width-input" className="block text-xs font-medium text-gray-700">
                Custom width (in)
              </label>
              <input
                id="width-input"
                type="number"
                min={CUSTOM_WIDTH_MIN_IN}
                max={CUSTOM_WIDTH_MAX_IN}
                value={value.widthIn}
                onChange={(e) => setCustomWidth(Number(e.target.value))}
                className="mt-1.5 block h-11 w-28 rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                aria-label="Custom width in inches"
                aria-describedby="width-helper"
              />
              <p id="width-helper" className="mt-1 text-xs text-gray-500">
                Min {CUSTOM_WIDTH_MIN_IN} in, max {CUSTOM_WIDTH_MAX_IN} in (upon request).
              </p>
            </div>
          )}
        </div>
        <div>
          <label htmlFor="length-input" className="block text-xs font-medium text-gray-700">
            Length
          </label>
          <input
            id="length-input"
            type="number"
            min={minLength}
            max={maxLength}
            value={value.lengthIn}
            onChange={(e) => setLength(Number(e.target.value))}
            className="mt-1.5 block h-11 w-28 rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            aria-label="Length in inches"
            aria-describedby="length-helper"
          />
          <p id="length-helper" className="mt-1 text-xs text-gray-500">
            Min {minLength} in, max {maxLength} in for {thicknessId}.
          </p>
        </div>
      </div>
    </div>
  );
}
