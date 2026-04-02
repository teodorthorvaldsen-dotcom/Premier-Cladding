import type { BoxTrayEdge, BoxTraySideRow } from "@/types/boxTray";
import { normalizeBoxTraySides, trayFoldRowTitles } from "@/lib/boxTray";

/** Identifies this JSON for Dynamo / pyRevit / manual BIM workflows. */
export const REVIT_TRAY_SCHEMA = "all-cladding-tray-panel/v1" as const;

export type RevitTrayEdgeLabel = "Front" | "Back" | "Left" | "Right";

export interface RevitTrayReturnRow {
  rowIndex: number;
  displayLabel: string;
  edge: RevitTrayEdgeLabel;
  edgeKey: BoxTrayEdge;
  returnHeightIn: number;
  angleDeg: number;
  /** 1-based row index of parent in this same `returns` list, or null for root returns off flat center. */
  parentRowIndex: number | null;
  parentId: string | null;
}

export interface RevitTrayExportPayload {
  schema: typeof REVIT_TRAY_SCHEMA;
  unitsLength: "in";
  unitsAngle: "deg";
  flatCenter: { widthIn: number; lengthIn: number };
  returns: RevitTrayReturnRow[];
}

const EDGE_LABEL: Record<BoxTrayEdge, RevitTrayEdgeLabel> = {
  south: "Front",
  north: "Back",
  west: "Left",
  east: "Right",
};

export function buildRevitTrayExportPayload(
  widthIn: number,
  lengthIn: number,
  sides: BoxTraySideRow[]
): RevitTrayExportPayload {
  const n = normalizeBoxTraySides(sides);
  const titles = trayFoldRowTitles(n);
  return {
    schema: REVIT_TRAY_SCHEMA,
    unitsLength: "in",
    unitsAngle: "deg",
    flatCenter: { widthIn, lengthIn },
    returns: n.map((row, i) => {
      const pix = row.parentId ? n.findIndex((r) => r.id === row.parentId) : -1;
      return {
        rowIndex: i + 1,
        displayLabel: titles[i] ?? `Row ${i + 1}`,
        edge: EDGE_LABEL[row.edge],
        edgeKey: row.edge,
        returnHeightIn: row.flangeHeightIn,
        angleDeg: row.angleDeg,
        parentRowIndex: pix >= 0 ? pix + 1 : null,
        parentId: row.parentId ?? null,
      };
    }),
  };
}

export function formatRevitTrayExportJson(
  widthIn: number,
  lengthIn: number,
  sides: BoxTraySideRow[]
): string {
  return JSON.stringify(buildRevitTrayExportPayload(widthIn, lengthIn, sides), null, 2);
}

function csvEscape(cell: string | number): string {
  const s = String(cell);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Single CSV table: flat size rows + header + return rows (import as schedule or parse in Dynamo). */
export function formatRevitTrayExportCsv(
  widthIn: number,
  lengthIn: number,
  sides: BoxTraySideRow[]
): string {
  const p = buildRevitTrayExportPayload(widthIn, lengthIn, sides);
  const lines: string[] = [
    `meta,flatCenterWidthIn,${p.flatCenter.widthIn}`,
    `meta,flatCenterLengthIn,${p.flatCenter.lengthIn}`,
    "rowIndex,displayLabel,edge,edgeKey,returnHeightIn,angleDeg,parentRowIndex",
  ];
  for (const r of p.returns) {
    lines.push(
      [
        r.rowIndex,
        csvEscape(r.displayLabel),
        r.edge,
        r.edgeKey,
        r.returnHeightIn,
        r.angleDeg,
        r.parentRowIndex ?? "",
      ].join(",")
    );
  }
  return lines.join("\n");
}
