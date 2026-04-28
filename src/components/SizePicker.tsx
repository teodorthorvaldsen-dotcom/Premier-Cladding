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
  defaultFullTraySides,
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
  /** Narrow Revit-style properties column */
  variant?: "default" | "propertiesPanel";
  /** UI wording ("panel" vs "flashing"). */
  productNoun?: "panel" | "flashing";
  /** When set to null, do not enforce a minimum in the UI. */
  minWidthIn?: number | null;
  /** When set to null, do not enforce a minimum in the UI. */
  minLengthIn?: number | null;
  /** Hide the "Allowed:" helper text block. */
  hideAllowedText?: boolean;
}

function getMaxLengthIn(thicknessId: ThicknessId): number {
  const mm = Number(thicknessId.replace("mm", ""));
  return maxLengthByThicknessMm[mm] ?? 190;
}

function clampWidth(val: number, minWidthIn: number): number {
  const n = Math.round(Number(val));
  if (Number.isNaN(n) || n < minWidthIn) return minWidthIn;
  return Math.min(CUSTOM_WIDTH_MAX_IN, Math.max(minWidthIn, n));
}

export function SizePicker({
  value,
  onChange,
  thicknessId,
  variant = "default",
  productNoun = "panel",
  minWidthIn = CUSTOM_WIDTH_MIN_IN,
  minLengthIn = MIN_LENGTH_IN,
  hideAllowedText = false,
}: SizePickerProps) {
  const isPanel = variant === "propertiesPanel";
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
    const minLen = minLengthIn ?? 0;
    if (Number.isNaN(n) || n < minLen) return minLen;
    return Math.min(maxLength, Math.max(minLen, n));
  };

  const pushSides = (next: BoxTraySideRow[]) => {
    onChange({
      ...value,
      boxSides: normalizeBoxTraySides(next),
    });
  };

  const handleWidthChange = (raw: string) => {
    setWidthStr(raw);
    if (raw === "") return;
    const num = Number(raw);
    if (Number.isNaN(num)) {
      const w = (minWidthIn ?? 0) || 0;
      const len = clampLength(value.lengthIn);
      onChange({
        ...value,
        widthId: "custom",
        widthIn: w,
        lengthIn: len,
      });
      return;
    }
    const w = clampWidth(num, (minWidthIn ?? 0) || 0);
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
    if (raw === "") return;
    const num = Number(raw);
    if (Number.isNaN(num)) {
      onChange({
        ...value,
        lengthIn: (minLengthIn ?? 0) || 0,
      });
      return;
    }
    const len = clampLength(num);
    onChange({
      ...value,
      lengthIn: len,
    });
  };

  const canAddSide = value.boxSides.length > 0 && value.boxSides.length < MAX_TRAY_SIDE_ROWS;

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

  const inW = isPanel
    ? "mt-1 block h-9 w-full rounded border border-gray-300 bg-white px-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400"
    : "mt-1.5 block h-11 w-28 rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2";

  return (
    <div>
      <label
        className={
          isPanel
            ? "block text-xs font-semibold uppercase tracking-wide text-gray-800"
            : "block text-sm font-medium text-gray-900"
        }
      >
        Size
      </label>
      {isPanel ? (
        <p className="mt-1 text-[10px] leading-snug text-gray-600">
          Width and length define the flat center face. Stay within the limits below; positive and negative angles match the
          3D preview.
        </p>
      ) : (
        !hideAllowedText ? (
          <p className="mt-0.5 text-xs text-gray-500">
            Enter width and length for the flat center face. Allowed: {CUSTOM_WIDTH_MIN_IN}–{CUSTOM_WIDTH_MAX_IN}&quot; wide,{" "}
            {MIN_LENGTH_IN}–{maxLength}&quot; long, up to {MAX_TRAY_SIDE_ROWS} returns (first four sides default to Front, Back,
            Left, Right at 90°).
          </p>
        ) : null
      )}
      <div
        className={isPanel ? "mt-2 space-y-3" : "mt-3 space-y-4"}
        role="group"
        aria-label={
          productNoun === "flashing"
            ? "Flashing width, length, and sides"
            : "Panel width, length, and panel sides"
        }
      >
        <div>
          <label htmlFor="width-input" className="block text-[10px] font-medium text-gray-700">
            Width (in)
          </label>
          <input
            id="width-input"
            type="number"
            inputMode="numeric"
            min={minWidthIn ?? undefined}
            max={CUSTOM_WIDTH_MAX_IN}
            value={widthStr}
            onChange={(e) => handleWidthChange(e.target.value)}
            onBlur={() => setWidthStr(String(value.widthIn))}
            className={inW}
            aria-label="Width in inches"
          />
        </div>
        <div>
          <label htmlFor="length-input" className="block text-[10px] font-medium text-gray-700">
            Length (in)
          </label>
          <input
            id="length-input"
            type="number"
            inputMode="numeric"
            min={minLengthIn ?? undefined}
            max={maxLength}
            value={lengthStr}
            onChange={(e) => handleLengthChange(e.target.value)}
            onBlur={() => setLengthStr(String(value.lengthIn))}
            className={inW}
            aria-label="Length in inches"
          />
        </div>

        <div
          className={
            isPanel
              ? "rounded border border-gray-300 bg-white p-2.5 shadow-sm"
              : "rounded-xl border border-gray-200/80 bg-gray-50/50 p-4"
          }
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium text-gray-800">
              {productNoun === "flashing" ? "Flashing Sides" : "Panel Sides"}
            </p>
            <button
              type="button"
              onClick={addSide}
              disabled={!canAddSide}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add side
            </button>
          </div>
          {!isPanel ? (
            <p className="mt-1.5 text-[11px] text-gray-500">
              Use <span className="font-medium text-gray-700">Add side</span> or{" "}
              <span className="font-medium text-gray-700">Add fold on this edge</span> to build returns, then set height and angle
              for each row. <span className="font-medium text-gray-700">Reverse bend</span> flips the bend direction.
            </p>
          ) : (
            <p className="mt-1 text-[9px] leading-snug text-gray-500">
              Add returns; stack folds with Add fold on this edge. Reverse bend flips direction.
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => pushSides([])}
              className={`rounded-lg border px-3 py-1.5 text-[13px] font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
                value.boxSides.length === 0
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
              }`}
              aria-pressed={value.boxSides.length === 0}
            >
              {productNoun === "flashing" ? "Flat flashing (no sides)" : "Flat panel (no sides)"}
            </button>
            <button
              type="button"
              onClick={() => pushSides(defaultFullTraySides())}
              className={`rounded-lg border px-3 py-1.5 text-[13px] font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
                value.boxSides.length > 0
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
              }`}
              aria-pressed={value.boxSides.length > 0}
            >
              {productNoun === "flashing"
                ? "Flashing sides (start at 1\")"
                : "Panel sides (start at 1\")"}
            </button>
          </div>

          {value.boxSides.length === 0 ? (
            <p className="mt-3 text-[13px] text-gray-600">
              {productNoun === "flashing" ? "No sides — flat flashing." : "No sides — flat panel."}
            </p>
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
                            Continues from the free edge on {EDGE_LABELS[side.edge]}.
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
                              className={
                                isPanel
                                  ? "mt-1 block h-8 w-full rounded border border-gray-300 bg-white px-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400"
                                  : "mt-1 block h-10 w-full rounded-lg border border-gray-200 px-2.5 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                              }
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
                              className={
                                isPanel
                                  ? "mt-1 block h-8 w-full rounded border border-gray-300 bg-white px-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400"
                                  : "mt-1 block h-10 w-full rounded-lg border border-gray-200 px-2.5 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                              }
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
                    <li
                      key={value.boxSides[rootIndex]!.id}
                      className={
                        isPanel
                          ? "rounded border border-gray-200 bg-gray-50/80 p-2"
                          : "rounded-lg border border-gray-200 bg-white p-3"
                      }
                    >
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
          <p className="mt-2 text-[11px] text-gray-500">
            Removes all sides (flat panel). Width and length are unchanged.
          </p>
        </div>
      </div>
    </div>
  );
}
