"use client";

import { useEffect, useState } from "react";
import {
  CUSTOM_WIDTH_MAX_IN,
  CUSTOM_WIDTH_MIN_IN,
  maxLengthByThicknessMm,
  MIN_LENGTH_IN,
} from "@/data/acm";
import type { ThicknessId } from "@/data/acm";

/** Bend line direction: X = hinge parallel to width (splits length into two legs); Y = hinge parallel to length (splits width). */
export type BendAxis = "x" | "y";

/** Minimum clear distance from fold to each end along the split dimension (inches). */
const MIN_LEG_IN = 0.5;

export interface SizeSelection {
  widthId: string | null;
  widthIn: number;
  lengthIn: number;
  bendAxis: BendAxis;
  /**
   * Inches from the reference edge to the fold line, measured along the dimension that is split.
   * X bend → along length (first leg below the fold in the preview). Y bend → along width (first leg left of the fold).
   */
  bendInchesFromEdge: number;
  /** Included angle between the two legs (0–180°). 90° = right-angle L. 0° or 180° shows as flat in the preview. */
  bendAngleDeg: number;
}

/** Keep fold position so both legs stay at least MIN_LEG_IN. */
export function clampBendInchesFromEdge(
  raw: number,
  axis: BendAxis,
  widthIn: number,
  lengthIn: number
): number {
  const along = axis === "x" ? lengthIn : widthIn;
  const n = Math.round(raw * 100) / 100;
  if (Number.isNaN(n)) return midpointBendInches(axis, widthIn, lengthIn);
  const lo = MIN_LEG_IN;
  const hi = Math.max(lo, along - MIN_LEG_IN);
  if (hi <= lo) return Math.round((along / 2) * 100) / 100;
  return Math.min(hi, Math.max(lo, n));
}

function midpointBendInches(axis: BendAxis, widthIn: number, lengthIn: number): number {
  const along = axis === "x" ? lengthIn : widthIn;
  return clampBendInchesFromEdge(along / 2, axis, widthIn, lengthIn);
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
  const [bendInchesStr, setBendInchesStr] = useState(() => String(value.bendInchesFromEdge));

  useEffect(() => {
    setBendInchesStr(String(value.bendInchesFromEdge));
  }, [value.bendInchesFromEdge]);

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
      const len = clampLength(value.lengthIn);
      onChange({
        ...value,
        widthId: "custom",
        widthIn: w,
        lengthIn: len,
        bendAxis: value.bendAxis,
        bendInchesFromEdge: clampBendInchesFromEdge(value.bendInchesFromEdge, value.bendAxis, w, len),
        bendAngleDeg: clampBendAngle(value.bendAngleDeg),
      });
      return;
    }
    const w = clampWidth(num);
    const len = clampLength(value.lengthIn);
    onChange({
      ...value,
      widthId: "custom",
      widthIn: w,
      lengthIn: len,
      bendAxis: value.bendAxis,
      bendInchesFromEdge: clampBendInchesFromEdge(value.bendInchesFromEdge, value.bendAxis, w, len),
      bendAngleDeg: clampBendAngle(value.bendAngleDeg),
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
        bendAxis: value.bendAxis,
        bendInchesFromEdge: clampBendInchesFromEdge(value.bendInchesFromEdge, value.bendAxis, value.widthIn, len),
        bendAngleDeg: clampBendAngle(value.bendAngleDeg),
      });
      return;
    }
    const len = clampLength(num);
    onChange({
      ...value,
      lengthIn: len,
      bendAxis: value.bendAxis,
      bendInchesFromEdge: clampBendInchesFromEdge(value.bendInchesFromEdge, value.bendAxis, value.widthIn, len),
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
        bendInchesFromEdge: value.bendInchesFromEdge,
      });
      return;
    }
    onChange({
      ...value,
      bendAxis: value.bendAxis,
      bendInchesFromEdge: value.bendInchesFromEdge,
      bendAngleDeg: clampBendAngle(num),
    });
  };

  const handleBendInchesChange = (raw: string) => {
    setBendInchesStr(raw);
    if (raw.trim() === "" || raw === "." || /^-?\d+\.$/.test(raw.trim())) {
      return;
    }
    const num = Number(raw);
    if (Number.isNaN(num)) {
      return;
    }
    const next = clampBendInchesFromEdge(num, value.bendAxis, value.widthIn, value.lengthIn);
    if (next !== value.bendInchesFromEdge) {
      onChange({ ...value, bendInchesFromEdge: next });
    }
  };

  const commitBendInches = () => {
    const num = Number(bendInchesStr);
    const next =
      bendInchesStr.trim() === "" || Number.isNaN(num)
        ? midpointBendInches(value.bendAxis, value.widthIn, value.lengthIn)
        : clampBendInchesFromEdge(num, value.bendAxis, value.widthIn, value.lengthIn);
    onChange({ ...value, bendInchesFromEdge: next });
    setBendInchesStr(String(next));
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
            X: hinge parallel to width — fold position is measured along length. Y: hinge parallel to length — fold
            position along width.
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
                  onChange={() =>
                    onChange({
                      ...value,
                      bendAxis: v,
                      bendInchesFromEdge: clampBendInchesFromEdge(
                        value.bendInchesFromEdge,
                        v,
                        value.widthIn,
                        value.lengthIn
                      ),
                    })
                  }
                  className="h-4 w-4 border-gray-300 text-gray-900 focus:ring-gray-400"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="bend-inches-input" className="block text-xs font-medium text-gray-700">
            Inches to fold from edge (in)
          </label>
          <p className="mt-0.5 text-[11px] text-gray-500">
            Distance from the reference edge to the bend line, along the length if axis is X or along the width if axis is
            Y. Must leave at least {MIN_LEG_IN} in on each side. Preview uses this for leg lengths.
          </p>
          <input
            id="bend-inches-input"
            type="number"
            inputMode="decimal"
            min={MIN_LEG_IN}
            max={value.bendAxis === "x" ? value.lengthIn - MIN_LEG_IN : value.widthIn - MIN_LEG_IN}
            step={0.01}
            value={bendInchesStr}
            onChange={(e) => handleBendInchesChange(e.target.value)}
            onBlur={commitBendInches}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            className="mt-1.5 block h-11 w-36 rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            aria-label="Inches from edge to bend fold"
          />
        </div>
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
        <div>
          <button
            type="button"
            onClick={() => {
              const mid = midpointBendInches("x", value.widthIn, value.lengthIn);
              setBendAngleStr("0");
              setBendInchesStr(String(mid));
              onChange({
                ...value,
                bendAxis: "x",
                bendAngleDeg: 0,
                bendInchesFromEdge: mid,
              });
            }}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[14px] font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Reset fold &amp; bend
          </button>
          <p className="mt-2 text-[11px] text-gray-500">
            Clears the bend angle (flat L preview), sets axis to X, and restores fold distance to half the split
            dimension.
          </p>
        </div>
      </div>
    </div>
  );
}
