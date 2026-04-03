import { allWidths, colors, thicknesses } from "@/data/acm";
import { formatBoxTrayReproductionOneLine, normalizeBoxTraySides } from "@/lib/boxTray";
import type { CartItem } from "@/types/cart";

/** One-line summary matching checkout “Order summary” line items. */
export function describeCartLineItem(item: CartItem): string {
  const widthLabel = item.standardId
    ? allWidths.find((w) => w.id === item.standardId)?.label ?? `${item.widthIn}"`
    : `${item.widthIn}"`;
  const sizeLabel = `${widthLabel} × ${item.heightIn} in`;
  const color = colors.find((c) => c.id === item.colorId)?.name ?? item.colorId;
  const thickness = thicknesses.find((t) => t.id === item.thicknessId)?.label ?? item.thicknessId;
  const trayNorm = item.boxTraySides?.length ? normalizeBoxTraySides(item.boxTraySides) : [];
  const repro =
    item.trayBuildSpec?.split("\n")[0] ??
    (trayNorm.length > 0 ? formatBoxTrayReproductionOneLine(trayNorm) : "");
  const parts = [sizeLabel, repro, color, thickness, item.panelTypeLabel].filter(Boolean);
  return parts.join(" · ");
}
