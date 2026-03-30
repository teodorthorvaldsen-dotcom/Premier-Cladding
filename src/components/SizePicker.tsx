"use client";

import { useEffect, useState } from "react";
import {
  CUSTOM_WIDTH_MAX_IN,
  CUSTOM_WIDTH_MIN_IN,
  maxLengthByThicknessMm,
  MIN_LENGTH_IN,
} from "@/data/acm";
import type { ThicknessId } from "@/data/acm";

const MIN_MAIN_FACE_IN = 1;

export interface SizeSelection {
  widthId: string | null;
  widthIn: number;
  lengthIn: number;
  /**
   * Optional depth (in) of the **right** return: the leg that folds 90° out of the main face.
   * The 3D preview updates to show this folded geometry.
   */
  rightReturnIn: number | null;
  /**
   * Optional depth (in) of the **top** return: the leg along the length edge that folds 90° upward in the preview.
   */
  topReturnIn: number | null;
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

function maxRightReturn(widthIn: number): number {
  return Math.max(0, widthIn - MIN_MAIN_FACE_IN);
}

function maxTopReturn(lengthIn: number): number {
  return Math.max(0, lengthIn - MIN_MAIN_FACE_IN);
}

function clampRightReturn(n: number, widthIn: number): number {
  const v = Math.round(Number(n) * 100) / 100;
  if (Number.isNaN(v)) return 0;
  return Math.min(Math.max(0, v), maxRightReturn(widthIn));
}

function clampTopReturn(n: number, lengthIn: number): number {
  const v = Math.round(Number(n) * 100) / 100;
  if (Number.isNaN(v)) return 0;
  return Math.min(Math.max(0, v), maxTopReturn(lengthIn));
}

export function SizePicker({ value, onChange, thicknessId }: SizePickerProps) {
  const maxLength = getMaxLengthIn(thicknessId);
  const [widthStr, setWidthStr] = useState(() => String(value.widthIn));
  const [lengthStr, setLengthStr] = useState(() => String(value.lengthIn));
  const [rightReturnStr, setRightReturnStr] = useState(() =>
    value.rightReturnIn == null ? "" : String(value.rightReturnIn)
  );
  const [topReturnStr, setTopReturnStr] = useState(() =>
    value.topReturnIn == null ? "" : String(value.topReturnIn)
  );

  useEffect(() => {
    setRightReturnStr(value.rightReturnIn == null ? "" : String(value.rightReturnIn));
  }, [value.rightReturnIn]);

  useEffect(() => {
    setTopReturnStr(value.topReturnIn == null ? "" : String(value.topReturnIn));
  }, [value.topReturnIn]);

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
        rightReturnIn:
          value.rightReturnIn == null
            ? null
            : clampRightReturn(value.rightReturnIn, w) || null,
        topReturnIn: value.topReturnIn,
      });
      return;
    }
    const w = clampWidth(num);
    onChange({
      widthId: "custom",
      widthIn: w,
      lengthIn: clampLength(value.lengthIn),
      rightReturnIn:
        value.rightReturnIn == null
          ? null
          : (() => {
              const c = clampRightReturn(value.rightReturnIn, w);
              return c > 0 ? c : null;
            })(),
      topReturnIn: value.topReturnIn,
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
        topReturnIn:
          value.topReturnIn == null
            ? null
            : clampTopReturn(value.topReturnIn, len) || null,
      });
      return;
    }
    const len = clampLength(num);
    onChange({
      ...value,
      lengthIn: len,
      topReturnIn:
        value.topReturnIn == null
          ? null
          : (() => {
              const c = clampTopReturn(value.topReturnIn, len);
              return c > 0 ? c : null;
            })(),
    });
  };

  const handleRightReturnChange = (raw: string) => {
    setRightReturnStr(raw);
    if (raw === "" || raw === ".") {
      onChange({ ...value, rightReturnIn: null });
      return;
    }
    const num = Number(raw);
    if (Number.isNaN(num)) {
      onChange({ ...value, rightReturnIn: null });
      return;
    }
    const c = clampRightReturn(num, value.widthIn);
    onChange({ ...value, rightReturnIn: c > 0 ? c : null });
  };

  const handleTopReturnChange = (raw: string) => {
    setTopReturnStr(raw);
    if (raw === "" || raw === ".") {
      onChange({ ...value, topReturnIn: null });
      return;
    }
    const num = Number(raw);
    if (Number.isNaN(num)) {
      onChange({ ...value, topReturnIn: null });
      return;
    }
    const c = clampTopReturn(num, value.lengthIn);
    onChange({ ...value, topReturnIn: c > 0 ? c : null });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900">Size</label>
      <p className="mt-0.5 text-xs text-gray-500">
        Overall width and length in inches. Optional returns add folded legs in the interactive 3D
        preview (90°). Leave returns blank for a flat panel.
      </p>
      <p
        className="mt-2 rounded-lg border border-gray-200/80 bg-gray-50/80 px-3 py-2 text-xs text-gray-600"
        role="note"
      >
        Minimum width: {CUSTOM_WIDTH_MIN_IN} in. Maximum width: {CUSTOM_WIDTH_MAX_IN} in. Minimum
        length: {MIN_LENGTH_IN} in. Maximum length: {maxLength} in ({Math.floor(maxLength / 12)} ft{" "}
        {maxLength % 12} in).
      </p>
      <div className="mt-3 space-y-4" role="group" aria-label="Panel size and optional folded returns">
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
            aria-label="Overall width in inches"
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
            aria-label="Overall length in inches"
          />
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-900">Folded returns (optional)</p>
          <p className="mt-0.5 text-[11px] text-gray-500">
            Depth of each bent leg in inches. The preview shows the panel folded in 3D (approximate
            geometry; confirm with shop drawings).
          </p>
        </div>
        <div>
          <label htmlFor="right-return-input" className="block text-xs font-medium text-gray-700">
            Right return depth (in)
          </label>
          <p className="mt-0.5 text-[11px] text-gray-500">
            Leg folding toward the right (max {maxRightReturn(value.widthIn).toFixed(2)} in so the
            main face stays at least {MIN_MAIN_FACE_IN} in). Leave blank for none.
          </p>
          <input
            id="right-return-input"
            type="number"
            inputMode="decimal"
            min={0}
            max={maxRightReturn(value.widthIn)}
            step="any"
            value={rightReturnStr}
            onChange={(e) => handleRightReturnChange(e.target.value)}
            onBlur={() =>
              setRightReturnStr(value.rightReturnIn == null ? "" : String(value.rightReturnIn))
            }
            placeholder="—"
            className="mt-1.5 block h-11 w-28 rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            aria-label="Right return depth in inches"
          />
        </div>
        <div>
          <label htmlFor="top-return-input" className="block text-xs font-medium text-gray-700">
            Top return depth (in)
          </label>
          <p className="mt-0.5 text-[11px] text-gray-500">
            Leg folding along the top edge (max {maxTopReturn(value.lengthIn).toFixed(2)} in).
            Leave blank for none.
          </p>
          <input
            id="top-return-input"
            type="number"
            inputMode="decimal"
            min={0}
            max={maxTopReturn(value.lengthIn)}
            step="any"
            value={topReturnStr}
            onChange={(e) => handleTopReturnChange(e.target.value)}
            onBlur={() =>
              setTopReturnStr(value.topReturnIn == null ? "" : String(value.topReturnIn))
            }
            placeholder="—"
            className="mt-1.5 block h-11 w-28 rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            aria-label="Top return depth in inches"
          />
        </div>
      </div>
    </div>
  );
}
