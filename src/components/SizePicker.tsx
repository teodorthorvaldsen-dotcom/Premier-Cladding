"use client";

import { useState } from "react";
import {
  CUSTOM_WIDTH_MAX_IN,
  CUSTOM_WIDTH_MIN_IN,
  maxLengthByThicknessMm,
  MIN_LENGTH_IN,
} from "@/data/acm";
import type { ThicknessId } from "@/data/acm";

export interface SizeSelection {
  widthId: string | null;
  widthIn: number;
  lengthIn: number;
  /** Extra flat length for bend development; preview length uses lengthIn + bendAllowanceIn. */
  bendAllowanceIn: number;
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
  const n = Math.round(Number(val));
  if (Number.isNaN(n) || n < CUSTOM_WIDTH_MIN_IN) return CUSTOM_WIDTH_MIN_IN;
  return Math.min(CUSTOM_WIDTH_MAX_IN, Math.max(CUSTOM_WIDTH_MIN_IN, n));
}

export function SizePicker({ value, onChange, thicknessId }: SizePickerProps) {
  const maxLength = getMaxLengthIn(thicknessId);
  const [widthStr, setWidthStr] = useState(() => String(value.widthIn));
  const [lengthStr, setLengthStr] = useState(() => String(value.lengthIn));
  const [bendAllowanceStr, setBendAllowanceStr] = useState(() =>
    String(value.bendAllowanceIn)
  );

  const clampLength = (val: number): number => {
    const n = Math.round(Number(val));
    if (Number.isNaN(n) || n < MIN_LENGTH_IN) return MIN_LENGTH_IN;
    return Math.min(maxLength, Math.max(MIN_LENGTH_IN, n));
  };

  const clampBendAllowance = (val: number): number => {
    const n = Math.round(Number(val));
    if (Number.isNaN(n) || n < 0) return 0;
    return Math.min(maxLength, n);
  };

  const handleWidthChange = (raw: string) => {
    setWidthStr(raw);
    const num = Number(raw);
    if (raw === "" || Number.isNaN(num)) {
      const w = CUSTOM_WIDTH_MIN_IN;
      onChange({
        widthId: "custom",
        widthIn: w,
        lengthIn: clampLength(value.lengthIn),
        bendAllowanceIn: clampBendAllowance(value.bendAllowanceIn),
      });
      return;
    }
    const w = clampWidth(num);
    onChange({
      widthId: "custom",
      widthIn: w,
      lengthIn: clampLength(value.lengthIn),
      bendAllowanceIn: clampBendAllowance(value.bendAllowanceIn),
    });
  };

  const handleLengthChange = (raw: string) => {
    setLengthStr(raw);
    const num = Number(raw);
    if (raw === "" || Number.isNaN(num)) {
      onChange({
        ...value,
        lengthIn: MIN_LENGTH_IN,
        bendAllowanceIn: clampBendAllowance(value.bendAllowanceIn),
      });
      return;
    }
    onChange({
      ...value,
      lengthIn: clampLength(num),
      bendAllowanceIn: clampBendAllowance(value.bendAllowanceIn),
    });
  };

  const handleBendAllowanceChange = (raw: string) => {
    setBendAllowanceStr(raw);
    const num = Number(raw);
    if (raw === "" || Number.isNaN(num)) {
      onChange({
        ...value,
        bendAllowanceIn: 0,
      });
      return;
    }
    onChange({
      ...value,
      bendAllowanceIn: clampBendAllowance(num),
    });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900">Size</label>
      <p className="mt-0.5 text-xs text-gray-500">
        Width, length, and bend allowance in inches—you can clear a field and type your own size. If your
        drawing uses another reference, note it on the quote or attach a drawing.
      </p>
      <p className="mt-2 rounded-lg border border-gray-200/80 bg-gray-50/80 px-3 py-2 text-xs text-gray-600" role="note">
        Minimum width: {CUSTOM_WIDTH_MIN_IN} in. Maximum width: {CUSTOM_WIDTH_MAX_IN} in. Minimum length: {MIN_LENGTH_IN}{" "}
        in. Maximum length: {maxLength} in ({Math.floor(maxLength / 12)} ft {maxLength % 12} in). Bend allowance: 0–{maxLength}{" "}
        in (adds to preview length only; pricing uses width × length).
      </p>
      <div className="mt-3 space-y-4" role="group" aria-label="Panel width, length, and bend allowance">
        <div>
          <label htmlFor="width-input" className="block text-xs font-medium text-gray-700">
            Width (in)
          </label>
          <input
            id="width-input"
            type="number"
            inputMode="numeric"
            min={CUSTOM_WIDTH_MIN_IN}
            max={CUSTOM_WIDTH_MAX_IN}
            value={widthStr}
            onChange={(e) => handleWidthChange(e.target.value)}
            onBlur={() => setWidthStr(String(value.widthIn))}
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
            inputMode="numeric"
            min={MIN_LENGTH_IN}
            max={maxLength}
            value={lengthStr}
            onChange={(e) => handleLengthChange(e.target.value)}
            onBlur={() => setLengthStr(String(value.lengthIn))}
            className="mt-1.5 block h-11 w-28 rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            aria-label="Length in inches"
          />
        </div>
        <div>
          <label
            htmlFor="bend-allowance-input"
            className="block text-xs font-medium text-gray-700"
          >
            Bend allowance (in)
          </label>
          <input
            id="bend-allowance-input"
            type="number"
            inputMode="numeric"
            min={0}
            max={maxLength}
            value={bendAllowanceStr}
            onChange={(e) => handleBendAllowanceChange(e.target.value)}
            onBlur={() => setBendAllowanceStr(String(value.bendAllowanceIn))}
            className="mt-1.5 block h-11 w-28 rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            aria-label="Bend allowance in inches"
          />
        </div>
      </div>
    </div>
  );
}
