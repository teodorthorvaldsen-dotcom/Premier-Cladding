"use client";

import { useEffect, useState } from "react";
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
  /** Inches from the left edge to a vertical bend line on the face (optional). */
  foldFromLeftIn: number | null;
  /** Inches from the bottom edge to a horizontal bend line on the face (optional). */
  foldFromBottomIn: number | null;
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

function clampFoldAlongWidth(inches: number, widthIn: number): number {
  const n = Math.round(Number(inches) * 100) / 100;
  if (Number.isNaN(n) || widthIn <= 0) return 0;
  return Math.min(Math.max(0, n), widthIn);
}

function clampFoldAlongLength(inches: number, lengthIn: number): number {
  const n = Math.round(Number(inches) * 100) / 100;
  if (Number.isNaN(n) || lengthIn <= 0) return 0;
  return Math.min(Math.max(0, n), lengthIn);
}

export function SizePicker({ value, onChange, thicknessId }: SizePickerProps) {
  const maxLength = getMaxLengthIn(thicknessId);
  const [widthStr, setWidthStr] = useState(() => String(value.widthIn));
  const [lengthStr, setLengthStr] = useState(() => String(value.lengthIn));
  const [foldLeftStr, setFoldLeftStr] = useState(() =>
    value.foldFromLeftIn == null ? "" : String(value.foldFromLeftIn)
  );
  const [foldBottomStr, setFoldBottomStr] = useState(() =>
    value.foldFromBottomIn == null ? "" : String(value.foldFromBottomIn)
  );

  useEffect(() => {
    setFoldLeftStr(value.foldFromLeftIn == null ? "" : String(value.foldFromLeftIn));
  }, [value.foldFromLeftIn]);

  useEffect(() => {
    setFoldBottomStr(value.foldFromBottomIn == null ? "" : String(value.foldFromBottomIn));
  }, [value.foldFromBottomIn]);

  const clampLength = (val: number): number => {
    const n = Math.round(Number(val));
    if (Number.isNaN(n) || n < MIN_LENGTH_IN) return MIN_LENGTH_IN;
    return Math.min(maxLength, Math.max(MIN_LENGTH_IN, n));
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
        foldFromLeftIn:
          value.foldFromLeftIn == null ? null : clampFoldAlongWidth(value.foldFromLeftIn, w),
        foldFromBottomIn: value.foldFromBottomIn,
      });
      return;
    }
    const w = clampWidth(num);
    onChange({
      widthId: "custom",
      widthIn: w,
      lengthIn: clampLength(value.lengthIn),
      foldFromLeftIn:
        value.foldFromLeftIn == null ? null : clampFoldAlongWidth(value.foldFromLeftIn, w),
      foldFromBottomIn: value.foldFromBottomIn,
    });
  };

  const handleLengthChange = (raw: string) => {
    setLengthStr(raw);
    const num = Number(raw);
    if (raw === "" || Number.isNaN(num)) {
      const len = MIN_LENGTH_IN;
      onChange({
        ...value,
        lengthIn: len,
        foldFromBottomIn:
          value.foldFromBottomIn == null ? null : clampFoldAlongLength(value.foldFromBottomIn, len),
      });
      return;
    }
    const len = clampLength(num);
    onChange({
      ...value,
      lengthIn: len,
      foldFromBottomIn:
        value.foldFromBottomIn == null ? null : clampFoldAlongLength(value.foldFromBottomIn, len),
    });
  };

  const handleFoldLeftChange = (raw: string) => {
    setFoldLeftStr(raw);
    if (raw === "" || raw === ".") {
      onChange({ ...value, foldFromLeftIn: null });
      return;
    }
    const num = Number(raw);
    if (Number.isNaN(num)) {
      onChange({ ...value, foldFromLeftIn: null });
      return;
    }
    onChange({
      ...value,
      foldFromLeftIn: clampFoldAlongWidth(num, value.widthIn),
    });
  };

  const handleFoldBottomChange = (raw: string) => {
    setFoldBottomStr(raw);
    if (raw === "" || raw === ".") {
      onChange({ ...value, foldFromBottomIn: null });
      return;
    }
    const num = Number(raw);
    if (Number.isNaN(num)) {
      onChange({ ...value, foldFromBottomIn: null });
      return;
    }
    onChange({
      ...value,
      foldFromBottomIn: clampFoldAlongLength(num, value.lengthIn),
    });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900">Size</label>
      <p className="mt-0.5 text-xs text-gray-500">
        Width and length in inches—you can clear a field and type your own size. Optional bend / fold
        lines are measured from the <span className="font-medium text-gray-700">bottom-left corner</span>{" "}
        of the panel face. If your drawing uses another reference, say so in your
        quote notes or attach a drawing.
      </p>
      <p className="mt-2 rounded-lg border border-gray-200/80 bg-gray-50/80 px-3 py-2 text-xs text-gray-600" role="note">
        Minimum width: {CUSTOM_WIDTH_MIN_IN} in. Maximum width: {CUSTOM_WIDTH_MAX_IN} in. Minimum length: {MIN_LENGTH_IN} in. Maximum length: {maxLength} in ({Math.floor(maxLength / 12)} ft {maxLength % 12} in).
      </p>
      <div className="mt-3 space-y-4" role="group" aria-label="Panel width, length, and optional bend lines">
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
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-900">Bend / fold lines (optional)</p>
          <p className="mt-0.5 text-[11px] text-gray-500">
            Each value is the distance from that edge to a bend line on the face.
          </p>
        </div>
        <div>
          <label htmlFor="fold-left-input" className="block text-xs font-medium text-gray-700">
            Distance from left edge (in)
          </label>
          <p className="mt-0.5 text-[11px] text-gray-500">
            Vertical line on the face. Leave blank if none.
          </p>
          <input
            id="fold-left-input"
            type="number"
            inputMode="decimal"
            min={0}
            max={value.widthIn}
            step="any"
            value={foldLeftStr}
            onChange={(e) => handleFoldLeftChange(e.target.value)}
            onBlur={() =>
              setFoldLeftStr(value.foldFromLeftIn == null ? "" : String(value.foldFromLeftIn))
            }
            placeholder="—"
            className="mt-1.5 block h-11 w-28 rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            aria-label="Distance from left edge to vertical bend line in inches"
          />
        </div>
        <div>
          <label htmlFor="fold-bottom-input" className="block text-xs font-medium text-gray-700">
            Distance from bottom edge (in)
          </label>
          <p className="mt-0.5 text-[11px] text-gray-500">
            Horizontal line on the face. Leave blank if none.
          </p>
          <input
            id="fold-bottom-input"
            type="number"
            inputMode="decimal"
            min={0}
            max={value.lengthIn}
            step="any"
            value={foldBottomStr}
            onChange={(e) => handleFoldBottomChange(e.target.value)}
            onBlur={() =>
              setFoldBottomStr(
                value.foldFromBottomIn == null ? "" : String(value.foldFromBottomIn)
              )
            }
            placeholder="—"
            className="mt-1.5 block h-11 w-28 rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            aria-label="Distance from bottom edge to horizontal bend line in inches"
          />
        </div>
      </div>
    </div>
  );
}
