"use client";

import { useState } from "react";
import {
  CUSTOM_WIDTH_MAX_IN,
  CUSTOM_WIDTH_MIN_IN,
  maxLengthByThicknessMm,
  MIN_LENGTH_IN,
} from "@/data/acm";
import type { ThicknessId } from "@/data/acm";

/** Bend line direction: X = hinge parallel to width (splits length into two legs); Y = hinge parallel to length (splits width). */
export type BendAxis = "x" | "y";

export interface SizeSelection {
  widthId: string | null;
  widthIn: number;
  lengthIn: number;
  bendAxis: BendAxis;
  /** Included angle between the two legs (0–180°). 90° = right-angle L. 0° or 180° shows as flat in the preview. */
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
    const n = Math.round(val * 10) / 10;
    if (Number.isNaN(n) || n < 0) return 0;
    return Math.min(180, n);
  };

  const handleWidthChange = (raw: string) => {
    setWidthStr(raw);
    const num = Number(raw);
    if (raw === "" || Number.isNaN(num)) {
      const w = CUSTOM_WIDTH_MIN_IN;
      onChange({
        ...value,
        widthId: "custom",
        widthIn: w,
        lengthIn: clampLength(value.lengthIn),
        bendAxis: value.bendAxis,
        bendAngleDeg: clampBendAngle(value.bendAngleDeg),
      });
      return;
    }
    const w = clampWidth(num);
    onChange({
      ...value,
      widthId: "custom",
      widthIn: w,
      lengthIn: clampLength(value.lengthIn),
      bendAxis: value.bendAxis,
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
        bendAxis: value.bendAxis,
        bendAngleDeg: clampBendAngle(value.bendAngleDeg),
      });
      return;
    }
    onChange({
      ...value,
      lengthIn: clampLength(num),
      bendAxis: value.bendAxis,
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
        bendAxis: value.bendAxis,
      });
      return;
    }
    onChange({
      ...value,
      bendAxis: value.bendAxis,
      bendAngleDeg: clampBendAngle(num),
    });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900">Size</label>
      <p className="mt-0.5 text-xs text-gray-500">
        Width and length in inches. Optional L-bend: pick whether the bend runs along the width (X) or length (Y), then
        set the angle between the two legs (90° = square L). Preview updates for bends; pricing still uses full width ×
        length (flat).
      </p>
      <p className="mt-2 rounded-lg border border-gray-200/80 bg-gray-50/80 px-3 py-2 text-xs text-gray-600" role="note">
        Minimum width: {CUSTOM_WIDTH_MIN_IN} in. Maximum width: {CUSTOM_WIDTH_MAX_IN} in. Minimum length: {MIN_LENGTH_IN}{" "}
        in. Maximum length: {maxLength} in ({Math.floor(maxLength / 12)} ft {maxLength % 12} in). Pricing uses width ×
        length.
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
        <fieldset className="min-w-0">
          <legend className="block text-xs font-medium text-gray-700">Bend axis</legend>
          <p className="mt-0.5 text-[11px] text-gray-500">
            X: hinge parallel to width (each leg uses half the length). Y: hinge parallel to length (each leg uses half the
            width).
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            {(
              [
                { id: "bend-axis-x", v: "x" as const, label: "X" },
                { id: "bend-axis-y", v: "y" as const, label: "Y" },
              ] as const
            ).map(({ id, v, label }) => (
              <label
                key={v}
                htmlFor={id}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border bg-white px-3 py-2 text-[15px] font-medium text-gray-800 ${
                  value.bendAxis === v
                    ? "border-gray-900 ring-2 ring-gray-400"
                    : "border-gray-200"
                }`}
              >
                <input
                  id={id}
                  type="radio"
                  name="bend-axis"
                  checked={value.bendAxis === v}
                  onChange={() => onChange({ ...value, bendAxis: v })}
                  className="h-4 w-4 border-gray-300 text-gray-900 focus:ring-gray-400"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="bend-angle-input" className="block text-xs font-medium text-gray-700">
            Bend angle (°)
          </label>
          <p className="mt-0.5 text-[11px] text-gray-500">
            Angle between the two legs inside the bend. Use 0 or 180° for a flat panel in the preview.
          </p>
          <input
            id="bend-angle-input"
            type="number"
            inputMode="decimal"
            min={0}
            max={180}
            step={0.1}
            value={bendAngleStr}
            onChange={(e) => handleBendAngleChange(e.target.value)}
            onBlur={() => {
              const n = value.bendAngleDeg;
              setBendAngleStr(Number.isInteger(n) ? String(n) : n.toFixed(1));
            }}
            className="mt-1.5 block h-11 w-32 rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            aria-label="Bend angle in degrees between legs"
          />
        </div>
      </div>
    </div>
  );
}
