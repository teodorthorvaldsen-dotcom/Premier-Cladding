"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PanelPreviewModal } from "@/components/PanelPreviewModal";
import { RevitTrayExportBlock } from "@/components/RevitTrayExportBlock";
import {
  allWidths,
  colors,
  finishes,
  thicknesses,
} from "@/data/acm";
import { useCart } from "@/context/CartContext";
import { usePortalSession } from "@/hooks/usePortalSession";
import {
  getPanelBendsFromCartItem,
  formatPanelBendsSummary,
  formatPanelBendsAlongWidthSummary,
} from "@/lib/panelBends";
import {
  formatBoxTrayReproductionOneLine,
  formatBoxTraySummary,
  normalizeBoxTraySides,
} from "@/lib/boxTray";
import { cartItemLineTotal, type CartItem } from "@/types/cart";

function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

function swatchImageSrc(color: (typeof colors)[number] | undefined): string | null {
  if (!color) return null;
  if ("swatchImage" in color && typeof (color as { swatchImage?: unknown }).swatchImage === "string") {
    return (color as { swatchImage: string }).swatchImage;
  }
  return null;
}

function describeItem(item: CartItem): string {
  const widthLabel = item.standardId
    ? allWidths.find((w) => w.id === item.standardId)?.label ??
      `${item.widthIn}"`
    : `${item.widthIn}"`;
  const sizeLabel = `${widthLabel} × ${item.heightIn} in`;
  const color = colors.find((c) => c.id === item.colorId)?.name ?? item.colorId;
  const finishLabel = item.finishId
    ? finishes.find((f) => f.id === item.finishId)?.label ?? ""
    : "";
  const thickness = thicknesses.find((t) => t.id === item.thicknessId)?.label ?? item.thicknessId;
  const bends = getPanelBendsFromCartItem(item);
  const bendL = bends.length > 0 ? `Length · ${formatPanelBendsSummary(bends)}` : "";
  const bendW =
    item.panelBendsAlongWidth && item.panelBendsAlongWidth.length > 0
      ? formatPanelBendsAlongWidthSummary(item.panelBendsAlongWidth)
      : "";
  const trayNorm = item.boxTraySides?.length ? normalizeBoxTraySides(item.boxTraySides) : [];
  const tray = trayNorm.length > 0 ? formatBoxTraySummary(trayNorm) : "";
  const repro =
    item.trayBuildSpec?.split("\n")[0] ??
    (trayNorm.length > 0 ? formatBoxTrayReproductionOneLine(trayNorm) : "");
  const reproHint =
    repro && item.trayBuildSpec && item.trayBuildSpec.includes("\n") ? `${repro}…` : repro;
  const parts = [
    sizeLabel,
    reproHint,
    tray,
    bendL,
    bendW,
    color,
    finishLabel,
    thickness,
    item.panelTypeLabel,
  ].filter(Boolean);
  return parts.join(" · ");
}

function CartLine({
  item,
  onRemove,
  onQuantityChange,
  onOpenInteractivePreview,
}: {
  item: CartItem;
  onRemove: () => void;
  onQuantityChange: (qty: number) => void;
  onOpenInteractivePreview: () => void;
}) {
  const color = colors.find((c) => c.id === item.colorId);
  const imageSrc = swatchImageSrc(color);
  const lineTotal = cartItemLineTotal(item);

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 flex-1 gap-3">
        <div className="flex shrink-0 flex-col gap-2">
          <button
            type="button"
            onClick={onOpenInteractivePreview}
            className="group relative block rounded-lg border border-gray-200 bg-[#f4f5f7] text-left shadow-sm transition hover:border-gray-400 hover:shadow focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            aria-label="Open enlarged 3D preview — drag to rotate, zoom with plus and minus"
          >
            {item.previewImageDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL from WebGL capture
              <img
                src={item.previewImageDataUrl}
                alt=""
                className="h-24 w-40 rounded-lg object-cover"
              />
            ) : (
              <span className="flex h-24 w-40 items-center justify-center px-2 text-center text-[11px] font-medium text-gray-600">
                3D preview
              </span>
            )}
            <span className="absolute bottom-1 left-1 right-1 rounded bg-black/55 px-1 py-0.5 text-center text-[10px] font-medium text-white opacity-90 backdrop-blur-sm group-hover:bg-black/65">
              Click — zoom &amp; rotate
            </span>
          </button>
          <div
            className="relative h-10 w-10 overflow-hidden rounded border border-gray-300 bg-gray-100"
            aria-hidden
          >
            {imageSrc ? (
              <Image src={imageSrc} alt="" fill className="object-cover" sizes="40px" />
            ) : (
              <div className="h-full w-full" style={{ backgroundColor: color?.swatchHex ?? "#ccc" }} />
            )}
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">{describeItem(item)}</p>
          {item.trayBuildSpec ? (
            <details className="mt-2 rounded-lg border border-gray-100 bg-gray-50/90 px-2 py-1.5">
              <summary className="cursor-pointer text-[13px] font-medium text-gray-700">
                Build spec
              </summary>
              <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words text-[11px] text-gray-600">
                {item.trayBuildSpec}
              </pre>
            </details>
          ) : null}
          <RevitTrayExportBlock item={item} />
          <p className="text-xs text-gray-500">
            {item.areaFt2.toFixed(2)} ft² per panel · {formatUSD(item.unitPrice)} per panel
          </p>
          {(item.customColorReference || item.customColorSpecFileName) && (
            <div className="mt-2 rounded-lg bg-gray-50 px-2 py-1.5 text-[15px] text-gray-600">
              {item.customColorReference ? (
                <p>
                  <span className="font-medium text-gray-700">Color reference:</span>{" "}
                  <span className="whitespace-pre-wrap">{item.customColorReference}</span>
                </p>
              ) : null}
              {item.customColorSpecFileName ? (
                <p className={item.customColorReference ? "mt-1" : ""}>
                  <span className="font-medium text-gray-700">Spec PDF:</span>{" "}
                  {item.customColorSpecFileName}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Qty</span>
          <input
            type="number"
            min={1}
            value={item.quantity}
            onChange={(e) =>
              onQuantityChange(Math.max(1, Math.floor(Number(e.target.value)) || 1))
            }
            className="h-11 w-20 rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            aria-label={`Quantity for ${describeItem(item)}`}
          />
        </label>
        <p className="w-20 text-right text-sm font-medium tabular-nums">
          {formatUSD(lineTotal)}
        </p>
        <button
          type="button"
          onClick={onRemove}
          className="text-sm text-red-600 hover:text-red-700 focus:outline-none focus:underline"
          aria-label={`Remove ${describeItem(item)} from cart`}
        >
          Remove
        </button>
      </div>
    </li>
  );
}

const SMALL_ORDER_THRESHOLD_FT2 = 100;
const SMALL_ORDER_FEE = 125;

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCart();
  const { isStaff, loading: sessionLoading } = usePortalSession();
  const [previewItemId, setPreviewItemId] = useState<string | null>(null);
  const previewItem = previewItemId ? items.find((i) => i.id === previewItemId) ?? null : null;
  const subtotal = items.reduce(
    (sum, i) => sum + cartItemLineTotal(i),
    0
  );
  const totalSqFt = items.reduce(
    (sum, i) => sum + i.areaFt2 * i.quantity,
    0
  );
  const smallOrderFee =
    totalSqFt < SMALL_ORDER_THRESHOLD_FT2 ? SMALL_ORDER_FEE : 0;
  const grandTotal = subtotal + smallOrderFee;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">Your Cart</h1>
        <p className="mt-2 text-[15px] text-gray-500">Your cart is empty.</p>
        {sessionLoading ? (
          <p className="mt-8 text-sm text-gray-500">Loading…</p>
        ) : isStaff ? (
          <Link
            href="/products/acm-panels"
            className="mt-8 inline-flex rounded-xl bg-gray-900 px-6 py-4 text-[15px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Configure panels
          </Link>
        ) : (
          <Link
            href="/consultation"
            className="mt-8 inline-flex rounded-xl bg-gray-900 px-6 py-4 text-[15px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Request a consultation
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <PanelPreviewModal
        item={previewItem}
        open={previewItemId !== null}
        onClose={() => setPreviewItemId(null)}
      />
      <div className="mb-12">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">Your Cart</h1>
        <p className="mt-2 text-[15px] text-gray-500">Review your items and totals.</p>
      </div>
      <ul className="mb-10 space-y-4">
        {items.map((item) => (
          <CartLine
            key={item.id}
            item={item}
            onRemove={() => removeItem(item.id)}
            onQuantityChange={(qty) => updateQuantity(item.id, qty)}
            onOpenInteractivePreview={() => setPreviewItemId(item.id)}
          />
        ))}
      </ul>
      <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">Subtotal</dt>
            <dd>{formatUSD(subtotal)}</dd>
          </div>
          {smallOrderFee > 0 && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Small Order Fee</dt>
              <dd>{formatUSD(smallOrderFee)}</dd>
            </div>
          )}
        </dl>
        <div className="mt-4 flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg font-semibold text-gray-900">
            Total: {formatUSD(grandTotal)}
          </p>
          <div className="flex flex-wrap gap-3">
            {isStaff ? (
              <Link
                href="/products/acm-panels"
                className="inline-block text-sm text-gray-600 hover:text-gray-900"
              >
                Continue configuring
              </Link>
            ) : null}
            <Link
              href="/checkout"
              className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-3 text-[15px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Request estimate
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
