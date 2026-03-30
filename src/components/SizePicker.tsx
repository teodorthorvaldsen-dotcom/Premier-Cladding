"use client";

import { useEffect, useState } from "react";
import {
  CUSTOM_WIDTH_MAX_IN,
  CUSTOM_WIDTH_MIN_IN,
  maxLengthByThicknessMm,
  MIN_LENGTH_IN,
} from "@/data/acm";
import type { ThicknessId } from "@/data/acm";
import { maxChannelReturnsSum } from "@/lib/acmFoldPreview";

export interface SizeSelection {
  widthId: string | null;
  widthIn: number;
  lengthIn: number;
  /** Depth (in) of the left leg folded 90° — use with right for a U-channel. */
  leftReturnIn: number | null;
  /** Depth (in) of the right leg folded 90°. */
  rightReturnIn: number | null;
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

function round2(n: number): number {
  return Math.round(Number(n) * 100) / 100;
}

export function SizePicker({ value, onChange, thicknessId }: SizePickerProps) {
  const maxLength = getMaxLengthIn(thicknessId);
  const [widthStr, setWidthStr] = useState(() => String(value.widthIn));
  const [lengthStr, setLengthStr] = useState(() => String(value.lengthIn));
  const [leftStr, setLeftStr] = useState(() =>
    value.leftReturnIn == null ? "" : String(value.leftReturnIn)
  );
  const [rightStr, setRightStr] = useState(() =>
    value.rightReturnIn == null ? "" : String(value.rightReturnIn)
  );

  useEffect(() => {
    setLeftStr(value.leftReturnIn == null ? "" : String(value.leftReturnIn));
  }, [value.leftReturnIn]);

  useEffect(() => {
    setRightStr(value.rightReturnIn == null ? "" : String(value.rightReturnIn));
  }, [value.rightReturnIn]);

  const clampLength = (val: number): number => {
    const n = Math.round(Number(val));
    if (Number.isNaN(n) || n < MIN_LENGTH_IN) return MIN_LENGTH_IN;
    return Math.min(maxLength, Math.max(MIN_LENGTH_IN, n));
  };

  const normalizeReturns = (
    w: number,
    L: number | null,
    R: number | null
  ): { left: number | null; right: number | null } => {
    const maxSum = maxChannelReturnsSum(w);
    let l = L ?? 0;
    let r = R ?? 0;
    if (l <= 0 && r <= 0) return { left: null, right: null };
    if (maxSum <= 0) return { left: null, right: null };
    if (l + r > maxSum) {
      const s = maxSum / (l + r);
      l *= s;
      r *= s;
    }
    return {
      left: l > 0.005 ? round2(l) : null,
      right: r > 0.005 ? round2(r) : null,
    };
  };

  const handleWidthChange = (raw: string) => {
    setWidthStr(raw);
    const num = Number(raw);
    if (raw === "" || Number.isNaN(num)) {
      const w = CUSTOM_WIDTH_MIN_IN;
      const { left, right } = normalizeReturns(w, value.leftReturnIn, value.rightReturnIn);
      onChange({
        widthId: "custom",
        widthIn: w,
        lengthIn: clampLength(value.lengthIn),
        leftReturnIn: left,
        rightReturnIn: right,
      });
      return;
    }
    const w = clampWidth(num);
    const { left, right } = normalizeReturns(w, value.leftReturnIn, value.rightReturnIn);
    onChange({
      widthId: "custom",
      widthIn: w,
      lengthIn: clampLength(value.lengthIn),
      leftReturnIn: left,
      rightReturnIn: right,
    });
  };

  const handleLengthChange = (raw: string) => {
    setLengthStr(raw);
    const num = Number(raw);
    if (raw === "" || Number.isNaN(num)) {
      onChange({
        ...value,
        lengthIn: MIN_LENGTH_IN,
      });
      return;
    }
    onChange({
      ...value,
      lengthIn: clampLength(num),
    });
  };

  const handleLeftChange = (raw: string) => {
    setLeftStr(raw);
    if (raw === "" || raw === ".") {
      onChange({ ...value, leftReturnIn: null });
      return;
    }
    const num = Number(raw);
    if (Number.isNaN(num)) {
      onChange({ ...value, leftReturnIn: null });
      return;
    }
    const maxSum = maxChannelReturnsSum(value.widthIn);
    const r = value.rightReturnIn ?? 0;
    const l = Math.min(Math.max(0, round2(num)), Math.max(0, maxSum - r));
    onChange({
      ...value,
      leftReturnIn: l > 0 ? l : null,
    });
  };

  const handleRightChange = (raw: string) => {
    setRightStr(raw);
    if (raw === "" || raw === ".") {
      onChange({ ...value, rightReturnIn: null });
      return;
    }
    const num = Number(raw);
    if (Number.isNaN(num)) {
      onChange({ ...value, rightReturnIn: null });
      return;
    }
    const maxSum = maxChannelReturnsSum(value.widthIn);
    const l = value.leftReturnIn ?? 0;
    const r = Math.min(Math.max(0, round2(num)), Math.max(0, maxSum - l));
    onChange({
      ...value,
      rightReturnIn: r > 0 ? r : null,
    });
  };

  const maxSum = maxChannelReturnsSum(value.widthIn);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900">Size</label>
      <p className="mt-0.5 text-xs text-gray-500">
        Overall width and length in inches. Optional side returns fold 90° in the 3D preview—one side
        for an L-shape, both for a U-channel (same depth on each side gives a symmetric U). Pricing
        still uses flat dimensions unless noted on your quote.
      </p>
      <p
        className="mt-2 rounded-lg border border-gray-200/80 bg-gray-50/80 px-3 py-2 text-xs text-gray-600"
        role="note"
      >
        Minimum width: {CUSTOM_WIDTH_MIN_IN} in. Maximum width: {CUSTOM_WIDTH_MAX_IN} in. Minimum
        length: {MIN_LENGTH_IN} in. Maximum length: {maxLength} in ({Math.floor(maxLength / 12)} ft{" "}
        {maxLength % 12} in). Left + right returns cannot exceed {maxSum.toFixed(2)} in (keeps at
        least 1 in of flat face).
      </p>
      <div className="mt-3 space-y-4" role="group" aria-label="Panel size and channel returns">
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
            aria-label="Length in inches"
          />
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-900">Folded returns (optional)</p>
          <p className="mt-0.5 text-[11px] text-gray-500">
            Leg depth in inches (90° fold in the preview). Drag the 3D view to see U-shapes and
            L-shapes. Confirm final geometry with shop drawings.
          </p>
        </div>
        <div>
          <label htmlFor="left-return-input" className="block text-xs font-medium text-gray-700">
            Left return depth (in)
          </label>
          <input
            id="left-return-input"
            type="number"
            inputMode="decimal"
            min={0}
            max={Math.max(0, maxSum - (value.rightReturnIn ?? 0))}
            step="any"
            value={leftStr}
            onChange={(e) => handleLeftChange(e.target.value)}
            onBlur={() =>
              setLeftStr(value.leftReturnIn == null ? "" : String(value.leftReturnIn))
            }
            placeholder="—"
            className="mt-1.5 block h-11 w-28 rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            aria-label="Left return depth in inches"
          />
        </div>
        <div>
          <label htmlFor="right-return-input" className="block text-xs font-medium text-gray-700">
            Right return depth (in)
          </label>
          <input
            id="right-return-input"
            type="number"
            inputMode="decimal"
            min={0}
            max={Math.max(0, maxSum - (value.leftReturnIn ?? 0))}
            step="any"
            value={rightStr}
            onChange={(e) => handleRightChange(e.target.value)}
            onBlur={() =>
              setRightStr(value.rightReturnIn == null ? "" : String(value.rightReturnIn))
            }
            placeholder="—"
            className="mt-1.5 block h-11 w-28 rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            aria-label="Right return depth in inches"
          />
        </div>
      </div>
    </div>
  );
}
