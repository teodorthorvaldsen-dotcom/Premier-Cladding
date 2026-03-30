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
  /** Bend angle in degrees (0–180); bent preview uses two legs of half lengthIn (fold at center). */
  bendAngleDeg: number;
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
  const [bendAngleStr, setBendAngleStr] = useState(() => String(value.bendAngleDeg));

  const clampLength = (val: number): number => {
    const n = Math.round(Number(val));
    if (Number.isNaN(n) || n < MIN_LENGTH_IN) return MIN_LENGTH_IN;
    return Math.min(maxLength, Math.max(MIN_LENGTH_IN, n));
  };

  const clampBendAngle = (val: number): number => {
    const n = Math.round(Number(val));
    if (Number.isNaN(n) || n < 0) return 0;
    return Math.min(180, n);
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
        bendAngleDeg: clampBendAngle(value.bendAngleDeg),
      });
      return;
    }
    const w = clampWidth(num);
    onChange({
      widthId: "custom",
      widthIn: w,
      lengthIn: clampLength(value.lengthIn),
      bendAngleDeg: clampBendAngle(value.bendAngleDeg),
    });
  };

  const handleLengthChange = (raw: string) => {
    setLengthStr(raw);
    const num = Number(raw);
    if (raw === "" || Number.isNaN(num)) {
      onChange({
        ...value,
        lengthIn: MIN_LENGTH_IN,
        bendAngleDeg: clampBendAngle(value.bendAngleDeg),
      });
      return;
    }
    onChange({
      ...value,
      lengthIn: clampLength(num),
      bendAngleDeg: clampBendAngle(value.bendAngleDeg),
    });
  };

  const handleBendAngleChange = (raw: string) => {
    setBendAngleStr(raw);
    const num = Number(raw);
    if (raw === "" || Number.isNaN(num)) {
      onChange({
        ...value,
        bendAngleDeg: 0,
      });
      return;
    }
    onChange({
      ...value,
      bendAngleDeg: clampBendAngle(num),
    });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900">Size</label>
      <p className="mt-0.5 text-xs text-gray-500">
        Width and length in inches; bend angle in degrees (0–180°). When bent, the preview treats each
        straight leg as half of your length (folded in half at the bend). Use <span className="font-medium">90° fold</span>{" "}
        for a square corner.
      </p>
      <p className="mt-2 rounded-lg border border-gray-200/80 bg-gray-50/80 px-3 py-2 text-xs text-gray-600" role="note">
        Minimum width: {CUSTOM_WIDTH_MIN_IN} in. Maximum width: {CUSTOM_WIDTH_MAX_IN} in. Minimum length: {MIN_LENGTH_IN}{" "}
        in. Maximum length: {maxLength} in ({Math.floor(maxLength / 12)} ft {maxLength % 12} in). Bend: 0–180°, preview
        only; pricing uses full width × length.
      </p>
      <div className="mt-3 space-y-4" role="group" aria-label="Panel width, length, and bend angle">
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
          <label htmlFor="bend-angle-input" className="block text-xs font-medium text-gray-700">
            Bend angle (°)
          </label>
          <input
            id="bend-angle-input"
            type="number"
            inputMode="numeric"
            min={0}
            max={180}
            value={bendAngleStr}
            onChange={(e) => handleBendAngleChange(e.target.value)}
            onBlur={() => setBendAngleStr(String(value.bendAngleDeg))}
            className="mt-1.5 block h-11 w-28 rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            aria-label="Bend angle in degrees"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              onClick={() => {
                onChange({ ...value, bendAngleDeg: 0 });
                setBendAngleStr("0");
              }}
            >
              Flat
            </button>
            <button
              type="button"
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              onClick={() => {
                onChange({ ...value, bendAngleDeg: 90 });
                setBendAngleStr("90");
              }}
            >
              90° fold
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
