"use client";

import { useEffect, useState } from "react";
import {
  CUSTOM_WIDTH_MAX_IN,
  CUSTOM_WIDTH_MIN_IN,
  maxLengthByThicknessMm,
  MIN_LENGTH_IN,
} from "@/data/acm";
import type { ThicknessId } from "@/data/acm";
import type { PanelBendSpec } from "@/types/panelBend";
import {
  maxPanelBendsForLength,
  normalizePanelBends,
  PANEL_BEND_MIN_LEG_IN,
  suggestNextBendInchesFromEdge,
} from "@/lib/panelBends";

export interface SizeSelection {
  widthId: string | null;
  widthIn: number;
  lengthIn: number;
  /** Folds from the reference edge along length, in order (each line is inches from that edge). */
  bends: PanelBendSpec[];
}

interface BendDraft {
  inches: string;
  angle: string;
}

function angleInputStr(deg: number): string {
  return Number.isInteger(deg) ? String(deg) : deg.toFixed(1);
}

function draftsFromBends(bends: PanelBendSpec[]): BendDraft[] {
  return bends.map((b) => ({
    inches: String(b.inchesFromEdge),
    angle: angleInputStr(b.angleDeg),
  }));
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

function clampBendAngle(val: number): number {
  const n = Math.round(val * 10) / 10;
  if (Number.isNaN(n) || n < 0) return 0;
  return Math.min(180, n);
}

export function SizePicker({ value, onChange, thicknessId }: SizePickerProps) {
  const maxLength = getMaxLengthIn(thicknessId);
  const [widthStr, setWidthStr] = useState(() => String(value.widthIn));
  const [lengthStr, setLengthStr] = useState(() => String(value.lengthIn));
  const [bendDrafts, setBendDrafts] = useState<BendDraft[]>(() => draftsFromBends(value.bends));

  useEffect(() => {
    setBendDrafts(draftsFromBends(value.bends));
  }, [value.bends]);

  const clampLength = (val: number): number => {
    const n = Math.round(Number(val));
    if (Number.isNaN(n) || n < MIN_LENGTH_IN) return MIN_LENGTH_IN;
    return Math.min(maxLength, Math.max(MIN_LENGTH_IN, n));
  };

  const maxBends = maxPanelBendsForLength(value.lengthIn);

  const pushNormalizedBends = (nextBends: PanelBendSpec[]) => {
    onChange({
      ...value,
      bends: normalizePanelBends(nextBends, value.lengthIn),
    });
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
        bends: normalizePanelBends(value.bends, len),
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
      bends: normalizePanelBends(value.bends, len),
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
        bends: normalizePanelBends(value.bends, len),
      });
      return;
    }
    const len = clampLength(num);
    onChange({
      ...value,
      lengthIn: len,
      bends: normalizePanelBends(value.bends, len),
    });
  };

  const commitBendRow = (index: number) => {
    const draft = bendDrafts[index];
    if (!draft) return;
    const inchNum = Number(draft.inches);
    const angNum = Number(draft.angle);
    const next = value.bends.map((b, i) => {
      if (i !== index) return b;
      return {
        inchesFromEdge: Number.isNaN(inchNum) ? b.inchesFromEdge : inchNum,
        angleDeg: Number.isNaN(angNum) ? b.angleDeg : clampBendAngle(angNum),
      };
    });
    pushNormalizedBends(next);
  };

  const handleBendInchesDraft = (index: number, raw: string) => {
    setBendDrafts((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], inches: raw };
      return copy;
    });
  };

  const handleBendAngleDraft = (index: number, raw: string) => {
    setBendDrafts((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], angle: raw };
      return copy;
    });
  };

  const addBend = () => {
    if (value.bends.length >= maxBends) return;
    const suggested = suggestNextBendInchesFromEdge(value.bends, value.lengthIn);
    pushNormalizedBends([...value.bends, { inchesFromEdge: suggested, angleDeg: 90 }]);
  };

  const removeBend = (index: number) => {
    pushNormalizedBends(value.bends.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900">Size</label>
      <p className="mt-0.5 text-xs text-gray-500">
        Width and length in inches. Add one or more folds along the panel length (hinge parallel to width). Each fold is
        measured from the same reference edge. Preview updates with every bend; pricing still uses full width × length
        (flat).
      </p>
      <p className="mt-2 rounded-lg border border-gray-200/80 bg-gray-50/80 px-3 py-2 text-xs text-gray-600" role="note">
        Minimum width: {CUSTOM_WIDTH_MIN_IN} in. Maximum width: {CUSTOM_WIDTH_MAX_IN} in. Minimum length: {MIN_LENGTH_IN}{" "}
        in. Maximum length: {maxLength} in ({Math.floor(maxLength / 12)} ft {maxLength % 12} in). Each straight segment
        must be at least {PANEL_BEND_MIN_LEG_IN} in. Up to {maxBends} fold{maxBends === 1 ? "" : "s"} for this length.
      </p>
      <div className="mt-3 space-y-4" role="group" aria-label="Panel width, length, and bends">
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

        <div className="rounded-xl border border-gray-200/80 bg-gray-50/50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium text-gray-800">Folds along length</p>
            <button
              type="button"
              onClick={addBend}
              disabled={value.bends.length >= maxBends}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add bend
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-gray-500">
            Bend 1 is closest to the reference edge; each additional bend is farther along the length. Angles are the
            included angle between the leg before and after each fold (90° = square). Use 0° or 180° for a straight
            continuation in the preview.
          </p>

          {value.bends.length === 0 ? (
            <p className="mt-3 text-[13px] text-gray-600">No bends — panel is flat in the 3D preview.</p>
          ) : (
            <ul className="mt-3 space-y-4">
              {value.bends.map((b, index) => (
                <li
                  key={`bend-${index}-${b.inchesFromEdge}-${b.angleDeg}`}
                  className="rounded-lg border border-gray-200 bg-white p-3"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-gray-700">Bend {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeBend(index)}
                      className="text-[12px] font-medium text-red-700 hover:underline focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1 rounded"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        className="block text-[11px] font-medium text-gray-600"
                        htmlFor={`bend-inches-${index}`}
                      >
                        Inches from edge (in)
                      </label>
                      <input
                        id={`bend-inches-${index}`}
                        type="number"
                        inputMode="decimal"
                        min={PANEL_BEND_MIN_LEG_IN}
                        max={value.lengthIn - PANEL_BEND_MIN_LEG_IN}
                        step={0.01}
                        value={bendDrafts[index]?.inches ?? String(b.inchesFromEdge)}
                        onChange={(e) => handleBendInchesDraft(index, e.target.value)}
                        onBlur={() => commitBendRow(index)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                        }}
                        className="mt-1 block h-10 w-full rounded-lg border border-gray-200 px-2.5 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-[11px] font-medium text-gray-600"
                        htmlFor={`bend-angle-${index}`}
                      >
                        Angle (°)
                      </label>
                      <input
                        id={`bend-angle-${index}`}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        max={180}
                        step={0.1}
                        value={bendDrafts[index]?.angle ?? angleInputStr(b.angleDeg)}
                        onChange={(e) => handleBendAngleDraft(index, e.target.value)}
                        onBlur={() => commitBendRow(index)}
                        className="mt-1 block h-10 w-full rounded-lg border border-gray-200 px-2.5 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={() => {
              onChange({
                ...value,
                bends: [],
              });
            }}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[14px] font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Reset all folds
          </button>
          <p className="mt-2 text-[11px] text-gray-500">Removes every bend so the 3D preview is a flat rectangle.</p>
        </div>
      </div>
    </div>
  );
}
