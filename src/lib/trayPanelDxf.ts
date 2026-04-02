import type { BoxTraySideRow } from "@/types/boxTray";
import { buildTrayFlatOutline } from "@/lib/trayFlatPattern2d";

function dxfLine(n: number | string): string {
  return String(n) + "\r\n";
}

/**
 * Minimal ASCII DXF (R12-style ENTITIES) with one closed POLYLINE in inches.
 * Compatible with typical CAD/CAM importers including batch DXF import workflows.
 */
export function buildTrayPanelDxf(
  widthIn: number,
  lengthIn: number,
  sides: BoxTraySideRow[],
  options?: { layer?: string }
): string {
  const layer = options?.layer ?? "TRAY_FLAT";
  const raw = buildTrayFlatOutline(widthIn, lengthIn, sides);
  const w = widthIn;
  const l = lengthIn;
  const outline =
    raw.length >= 3
      ? raw
      : [
          { x: -w / 2, y: 0 },
          { x: w / 2, y: 0 },
          { x: w / 2, y: l },
          { x: -w / 2, y: l },
        ];

  let out = "";
  out += dxfLine(0);
  out += dxfLine("SECTION");
  out += dxfLine(2);
  out += dxfLine("HEADER");
  out += dxfLine(9);
  out += dxfLine("$INSUNITS");
  out += dxfLine(70);
  out += dxfLine(1);
  out += dxfLine(0);
  out += dxfLine("ENDSEC");
  out += dxfLine(0);
  out += dxfLine("SECTION");
  out += dxfLine(2);
  out += dxfLine("ENTITIES");

  out += dxfLine(0);
  out += dxfLine("POLYLINE");
  out += dxfLine(8);
  out += dxfLine(layer);
  out += dxfLine(66);
  out += dxfLine(1);
  out += dxfLine(70);
  out += dxfLine(1);
  for (const p of outline) {
    out += dxfLine(0);
    out += dxfLine("VERTEX");
    out += dxfLine(8);
    out += dxfLine(layer);
    out += dxfLine(10);
    out += dxfLine(p.x);
    out += dxfLine(20);
    out += dxfLine(p.y);
  }
  out += dxfLine(0);
  out += dxfLine("SEQEND");
  out += dxfLine(8);
  out += dxfLine(layer);
  out += dxfLine(0);
  out += dxfLine("ENDSEC");
  out += dxfLine(0);
  out += dxfLine("EOF");
  return out;
}
