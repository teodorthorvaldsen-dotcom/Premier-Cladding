"use client";

import { colors, finishes, thicknesses } from "@/data/acm";
import {
  getPanelBendsFromCartItem,
  formatPanelBendsSummary,
  formatPanelBendsAlongWidthSummary,
} from "@/lib/panelBends";
import { getCartSizeLabel, getCartTrayLines } from "@/lib/describeCartLineItem";
import type { CartItem } from "@/types/cart";

export function CartItemMeasurementBlock({ item }: { item: CartItem }) {
  const sizeLabel = getCartSizeLabel(item);
  const trayLines = getCartTrayLines(item);
  const color = colors.find((c) => c.id === item.colorId)?.name ?? item.colorId;
  const finishLabel = item.finishId
    ? finishes.find((f) => f.id === item.finishId)?.label ?? ""
    : "";
  const thickness = thicknesses.find((t) => t.id === item.thicknessId)?.label ?? item.thicknessId;
  const bends = getPanelBendsFromCartItem(item);
  const bendL = bends.length > 0 ? `Length: ${formatPanelBendsSummary(bends)}` : "";
  const bendW =
    item.panelBendsAlongWidth && item.panelBendsAlongWidth.length > 0
      ? `Width: ${formatPanelBendsAlongWidthSummary(item.panelBendsAlongWidth)}`
      : "";

  const productKindLabel =
    item.productLabel ??
    (item.productKind === "flashing" ? "Flashing" : item.productKind === "acm" ? "ACM Panels" : "");
  const clipsLabel =
    typeof item.clipsNeeded === "number" && Number.isFinite(item.clipsNeeded) && item.clipsNeeded > 0
      ? `${Math.round(item.clipsNeeded)} clips/panel`
      : "";
  const productBits = [productKindLabel, color, finishLabel, thickness, item.panelTypeLabel, clipsLabel].filter(Boolean);

  return (
    <div className="space-y-2 text-gray-900">
      <p className="text-base font-semibold tabular-nums text-gray-900">
        <span className="text-gray-500">Size </span>
        {sizeLabel}
      </p>

      {trayLines.length > 0 ? (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Returns</p>
          <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-[13px] leading-snug text-gray-800 marker:font-medium marker:text-gray-500">
            {trayLines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ol>
        </div>
      ) : null}

      {productBits.length > 0 ? (
        <p className="text-[13px] text-gray-800">
          <span className="font-medium text-gray-900">Product </span>
          {productBits.join(" · ")}
        </p>
      ) : null}

      {bendL || bendW ? (
        <p className="text-[12px] text-gray-600">
          {[bendL, bendW].filter(Boolean).join(" · ")}
        </p>
      ) : null}
    </div>
  );
}
