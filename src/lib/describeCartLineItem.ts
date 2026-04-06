import { allWidths, colors, finishes, thicknesses } from "@/data/acm";
import { formatBoxTrayReproductionSpec, normalizeBoxTraySides } from "@/lib/boxTray";
import type { CartItem } from "@/types/cart";

export function getCartSizeLabel(item: CartItem): string {
  const widthLabel = item.standardId
    ? allWidths.find((w) => w.id === item.standardId)?.label ?? `${item.widthIn}"`
    : `${item.widthIn}"`;
  return `${widthLabel} × ${item.heightIn} in`;
}

/** Per-return lines; prefers live geometry (`boxTraySides`) over stored `trayBuildSpec`. */
export function getCartTrayLines(item: CartItem): string[] {
  const trayNorm = item.boxTraySides?.length ? normalizeBoxTraySides(item.boxTraySides) : [];
  if (trayNorm.length > 0) {
    return formatBoxTrayReproductionSpec(trayNorm)
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (item.trayBuildSpec?.trim()) {
    return item.trayBuildSpec
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * One-line summary for checkout / order rows and aria-labels (no full tray dump).
 */
export function describeCartLineItem(item: CartItem): string {
  const sizeLabel = getCartSizeLabel(item);
  const color = colors.find((c) => c.id === item.colorId)?.name ?? item.colorId;
  const finishLabel = item.finishId
    ? finishes.find((f) => f.id === item.finishId)?.label ?? ""
    : "";
  const thickness = thicknesses.find((t) => t.id === item.thicknessId)?.label ?? item.thicknessId;
  const trayLines = getCartTrayLines(item);
  const trayShort =
    trayLines.length === 0
      ? ""
      : trayLines.length === 1
        ? trayLines[0]!
        : `${trayLines.length} returns`;
  const parts = [sizeLabel, trayShort || undefined, color, finishLabel, thickness, item.panelTypeLabel].filter(
    Boolean
  );
  return parts.join(" · ");
}
