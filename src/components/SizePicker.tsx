"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CUSTOM_WIDTH_MAX_IN,
  CUSTOM_WIDTH_MIN_IN,
  maxLengthByThicknessMm,
  MIN_LENGTH_IN,
} from "@/data/acm";
import type { ThicknessId } from "@/data/acm";
import type { BoxTrayEdge, BoxTraySideRow } from "@/types/boxTray";
import {
  MAX_TRAY_SIDE_ROWS,
  normalizeBoxTraySides,
  trayDefaultAngleDegForSlot,
  trayEdgeForSlotIndex,
  trayFoldRowTitles,
} from "@/lib/boxTray";
import { clampAngleDeg } from "@/lib/panelBends";

const EDGE_LABELS: Record<BoxTrayEdge, string> = {
  south: "Front",
  north: "Back",
  west: "Left",
  east: "Right",
};

export interface SizeSelection {
  widthId: string | null;
  widthIn: number;
  lengthIn: number;
  /**
   * Tray returns in list order. Extra folds on one edge use `parentId` and are stored consecutively; preview chains them from the free edge of the previous return.
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

function newBoxSideRow(edge: BoxTrayEdge, angleDeg = 90, parentId?: string): BoxTraySideRow {
  return {
    id: newSideId(),
    edge,
    flangeHeightIn: 1,
    angleDeg,
    ...(parentId ? { parentId } : {}),
  };
}

function collectSubtreeIds(all: BoxTraySideRow[], rootId: string): Set<string> {
  const out = new Set<string>([rootId]);
  let growing = true;
  while (growing) {
    growing = false;
    for (const s of all) {
      if (s.parentId && out.has(s.parentId) && !out.has(s.id)) {
        out.add(s.id);
        growing = true;
      }
    }
  }
  return out;
}

function lastDescendantIndex(all: BoxTraySideRow[], startIndex: number): number {
  const root = all[startIndex];
  if (!root) return startIndex;
  const subtree = collectSubtreeIds(all, root.id);
  let max = startIndex;
  for (let i = startIndex; i < all.length; i++) {
    if (subtree.has(all[i]!.id)) max = i;
  }
  return max;
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

  const canAddSide = value.boxSides.length < MAX_TRAY_SIDE_ROWS;

  const addSide = () => {
    if (!canAddSide) return;
    const i = value.boxSides.length;
    pushSides([
      ...value.boxSides,
      newBoxSideRow(trayEdgeForSlotIndex(i), trayDefaultAngleDegForSlot(i)),
    ]);
  };

  /** New return attaches to the row whose control fired this (root side or an intermediate fold). */
  const addFoldOnSameEdgeAfter = (afterIndex: number) => {
    if (!canAddSide) return;
    const anchor = value.boxSides[afterIndex];
    if (!anchor) return;
    const leafIdx = lastDescendantIndex(value.boxSides, afterIndex);
    const row = newBoxSideRow(anchor.edge, 90, anchor.id);
    const next = [...value.boxSides.slice(0, leafIdx + 1), row, ...value.boxSides.slice(leafIdx + 1)];
    pushSides(next);
  };

  const foldRowTitles = useMemo(() => trayFoldRowTitles(value.boxSides), [value.boxSides]);

  const removeSide = (id: string) => {
    const drop = collectSubtreeIds(value.boxSides, id);
    pushSides(value.boxSides.filter((s) => !drop.has(s.id)));
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
        returns. First four rows default to Front, Back, Left, Right; you can add another fold on any row on the same
        edge (stacked returns). New rows default to 90°.
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
            Rows 1–4 start as Front, Back, Left, Right; <span className="font-medium text-gray-700">Add side</span> continues the pattern. Use{" "}
            <span className="font-medium text-gray-700">Add fold on this edge</span> on a side or on a fold to chain returns from that
            segment’s free edge (names like <span className="font-medium text-gray-700">Side 2: F1, F2, F3</span> or{" "}
            <span className="font-medium text-gray-700">Side 2: F2, F1</span> off the second top fold). Set depth and angle;{" "}
            <span className="font-medium text-gray-700">Reverse bend</span> flips direction.
          </p>

          {value.boxSides.length === 0 ? (
            <p className="mt-3 text-[13px] text-gray-600">No sides — flat panel.</p>
          ) : (
            <ul className="mt-3 space-y-4">
              {value.boxSides
                .map((s, i) => (!s.parentId ? i : -1))
                .filter((i): i is number => i >= 0)
                .map((rootIndex) => {
                  const renderNode = (index: number, isRoot: boolean): ReactNode => {
                    const side = value.boxSides[index];
                    if (!side) return null;
                    const childIndices = value.boxSides
                      .map((s, i) => (s.parentId === side.id ? i : -1))
                      .filter((i) => i >= 0)
                      .sort((a, b) => a - b);
                    return (
                      <div
                        className={isRoot ? undefined : "mt-4 border-l-2 border-gray-200/90 pl-3"}
                        key={side.id}
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-gray-700">
                            {foldRowTitles[index] ?? `Side ${index + 1}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSide(side.id)}
                            className="rounded text-[12px] font-medium text-red-700 hover:underline focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1"
                          >
                            Remove
                          </button>
                        </div>
                        {isRoot ? (
                          <div className="mb-3">
                            <p className="text-[11px] font-medium text-gray-600">Edge</p>
                            <p
                              className="mt-1 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-2.5 text-[15px] text-gray-800"
                              aria-label={`Edge: ${EDGE_LABELS[side.edge]}`}
                            >
                              {EDGE_LABELS[side.edge]}
                            </p>
                            <button
                              type="button"
                              onClick={() => addFoldOnSameEdgeAfter(index)}
                              disabled={!canAddSide}
                              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-[12px] font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Add fold on this edge
                            </button>
                          </div>
                        ) : (
                          <p className="mb-2 text-[11px] text-gray-500">
                            Continues on {EDGE_LABELS[side.edge]} (free edge of this return)
                          </p>
                        )}
                        {!isRoot ? (
                          <button
                            type="button"
                            onClick={() => addFoldOnSameEdgeAfter(index)}
                            disabled={!canAddSide}
                            className="mb-3 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-[12px] font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Add fold on this edge
                          </button>
                        ) : null}
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
                        {childIndices.map((ci) => renderNode(ci, false))}
                      </div>
                    );
                  };

                  return (
                    <li key={value.boxSides[rootIndex]!.id} className="rounded-lg border border-gray-200 bg-white p-3">
                      {renderNode(rootIndex, true)}
                    </li>
                  );
                })}
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
