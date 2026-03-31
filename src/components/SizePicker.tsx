"use client";

import { useEffect, useState } from "react";
import {
  CUSTOM_WIDTH_MAX_IN,
  CUSTOM_WIDTH_MIN_IN,
  maxLengthByThicknessMm,
  MIN_LENGTH_IN,
} from "@/data/acm";
import type { ThicknessId } from "@/data/acm";
import type { BoxTrayEdge, BoxTraySideRow } from "@/types/boxTray";
import { MAX_TRAY_SIDE_ROWS, normalizeBoxTraySides } from "@/lib/boxTray";
import { clampAngleDeg } from "@/lib/panelBends";

const ALL_EDGES: BoxTrayEdge[] = ["south", "north", "west", "east"];

const EDGE_LABELS: Record<BoxTrayEdge, string> = {
  south: "Front (y = 0, spans width)",
  north: "Back (y = length)",
  west: "Left (x = −W/2, spans length)",
  east: "Right (x = +W/2, spans length)",
};

export interface SizeSelection {
  widthId: string | null;
  widthIn: number;
  lengthIn: number;
  /**
   * Tray returns in list order. The same edge may appear more than once (stacked returns); 3D offsets them along that edge.
   */
  boxSides: BoxTraySideRow[];
}

interface SideDraft {
  height: string;
  angle: string;
}

function angleInputStr(deg: number): string {
  return Number.isInteger(deg) ? String(deg) : deg.toFixed(1);
}

function newSideId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `bx-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function newBoxSideRow(edge: BoxTrayEdge): BoxTraySideRow {
  return { id: newSideId(), edge, flangeHeightIn: 6, angleDeg: 90 };
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
  const [sideDrafts, setSideDrafts] = useState<SideDraft[]>(() =>
    value.boxSides.map((s) => ({
      height: String(s.flangeHeightIn),
      angle: angleInputStr(s.angleDeg),
    }))
  );

  useEffect(() => {
    setSideDrafts(
      value.boxSides.map((s) => ({
        height: String(s.flangeHeightIn),
        angle: angleInputStr(s.angleDeg),
      }))
    );
  }, [value.boxSides]);

  const clampLength = (val: number): number => {
    const n = Math.round(Number(val));
    if (Number.isNaN(n) || n < MIN_LENGTH_IN) return MIN_LENGTH_IN;
    return Math.min(maxLength, Math.max(MIN_LENGTH_IN, n));
  };

  const pushSides = (next: BoxTraySideRow[]) => {
    onChange({
      ...value,
      boxSides: normalizeBoxTraySides(next),
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
    const len = clampLength(num);
    onChange({
      ...value,
      lengthIn: len,
    });
  };

  const usedEdges = new Set(value.boxSides.map((s) => s.edge));
  const canAddSide = value.boxSides.length < MAX_TRAY_SIDE_ROWS;
  const nextEdgeToAdd = ALL_EDGES.find((e) => !usedEdges.has(e)) ?? "west";

  const addSide = () => {
    if (!canAddSide) return;
    pushSides([...value.boxSides, newBoxSideRow(nextEdgeToAdd)]);
  };

  const removeSide = (id: string) => {
    pushSides(value.boxSides.filter((s) => s.id !== id));
  };

  const setRowEdge = (id: string, edge: BoxTrayEdge) => {
    pushSides(value.boxSides.map((s) => (s.id === id ? { ...s, edge } : s)));
  };

  const commitRow = (index: number) => {
    const row = value.boxSides[index];
    const draft = sideDrafts[index];
    if (!row || !draft) return;
    const hNum = Number(draft.height);
    const aNum = Number(draft.angle);
    const next = value.boxSides.map((s, i) => {
      if (i !== index) return s;
      return {
        ...s,
        flangeHeightIn: Number.isNaN(hNum) ? s.flangeHeightIn : hNum,
        angleDeg: Number.isNaN(aNum) ? s.angleDeg : clampAngleDeg(aNum),
      };
    });
    pushSides(next);
  };

  const reverseRowBend = (id: string) => {
    const next = value.boxSides.map((s) =>
      s.id === id ? { ...s, angleDeg: clampAngleDeg(-(Number(s.angleDeg) || 0)) } : s
    );
    pushSides(next);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900">Size</label>
      <p className="mt-0.5 text-xs text-gray-500">
        Width and length set the <span className="font-medium text-gray-800">flat center face</span> of the tray (always
        that width × length in the preview). Each side you add is a return with its own height in inches and bend angle.
        Pricing still uses full width × length (flat). Positive° bends a side outward (+Z); negative° bends inward.
      </p>
      <p className="mt-2 rounded-lg border border-gray-200/80 bg-gray-50/80 px-3 py-2 text-xs text-gray-600" role="note">
        Minimum width: {CUSTOM_WIDTH_MIN_IN} in. Maximum width: {CUSTOM_WIDTH_MAX_IN} in. Minimum length: {MIN_LENGTH_IN}{" "}
        in. Maximum length: {maxLength} in ({Math.floor(maxLength / 12)} ft {maxLength % 12} in). Up to {MAX_TRAY_SIDE_ROWS}{" "}
        returns; several may use the same edge (stacked). New rows pick a free edge when possible, otherwise default to
        left.
      </p>
      <div className="mt-3 space-y-4" role="group" aria-label="Panel width, length, and tray sides">
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
            <p className="text-xs font-medium text-gray-800">Tray sides (returns)</p>
            <button
              type="button"
              onClick={addSide}
              disabled={!canAddSide}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add side
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-gray-500">
            Choose edge, return depth, and angle.             The list order stays fixed while you edit. You can set the same edge on multiple rows (e.g. several “left”
            returns). Use <span className="font-medium text-gray-700">Reverse bend</span> or a negative angle if a flange
            should fold the other way. Edges: front/back = full width; left/right = full length.
          </p>

          {value.boxSides.length === 0 ? (
            <p className="mt-3 text-[13px] text-gray-600">No sides — flat panel.</p>
          ) : (
            <ul className="mt-3 space-y-4">
              {value.boxSides.map((side, index) => (
                <li key={side.id} className="rounded-lg border border-gray-200 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-gray-700">Side {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeSide(side.id)}
                      className="rounded text-[12px] font-medium text-red-700 hover:underline focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mb-3">
                    <label className="block text-[11px] font-medium text-gray-600" htmlFor={`edge-${side.id}`}>
                      Edge
                    </label>
                    <select
                      id={`edge-${side.id}`}
                      value={side.edge}
                      onChange={(e) => setRowEdge(side.id, e.target.value as BoxTrayEdge)}
                      className="mt-1 block h-10 w-full rounded-lg border border-gray-200 bg-white px-2.5 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                    >
                      {ALL_EDGES.map((e) => (
                        <option key={e} value={e}>
                          {EDGE_LABELS[e]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        className="block text-[11px] font-medium text-gray-600"
                        htmlFor={`side-h-${side.id}`}
                      >
                        Return height (in)
                      </label>
                      <input
                        id={`side-h-${side.id}`}
                        type="number"
                        inputMode="decimal"
                        min={0.01}
                        max={120}
                        step={0.01}
                        value={sideDrafts[index]?.height ?? String(side.flangeHeightIn)}
                        onChange={(e) =>
                          setSideDrafts((prev) => {
                            const copy = [...prev];
                            copy[index] = { ...copy[index], height: e.target.value };
                            return copy;
                          })
                        }
                        onBlur={() => commitRow(index)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                        }}
                        className="mt-1 block h-10 w-full rounded-lg border border-gray-200 px-2.5 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-[11px] font-medium text-gray-600"
                        htmlFor={`side-a-${side.id}`}
                      >
                        Angle (°)
                      </label>
                      <input
                        id={`side-a-${side.id}`}
                        type="number"
                        inputMode="decimal"
                        min={-180}
                        max={180}
                        step={0.1}
                        value={sideDrafts[index]?.angle ?? angleInputStr(side.angleDeg)}
                        onChange={(e) =>
                          setSideDrafts((prev) => {
                            const copy = [...prev];
                            copy[index] = { ...copy[index], angle: e.target.value };
                            return copy;
                          })
                        }
                        onBlur={() => commitRow(index)}
                        className="mt-1 block h-10 w-full rounded-lg border border-gray-200 px-2.5 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                      />
                      <button
                        type="button"
                        onClick={() => reverseRowBend(side.id)}
                        className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-[12px] font-medium text-gray-800 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                      >
                        Reverse bend
                      </button>
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
                boxSides: [],
              });
            }}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[14px] font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Clear all sides
          </button>
          <p className="mt-2 text-[11px] text-gray-500">Removes every tray return; center size stays the same.</p>
        </div>
      </div>
    </div>
  );
}
