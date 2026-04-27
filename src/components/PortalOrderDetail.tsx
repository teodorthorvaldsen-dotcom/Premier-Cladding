"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { CartItemMeasurementBlock } from "@/components/CartItemMeasurementBlock";
import { PanelPreviewModal } from "@/components/PanelPreviewModal";
import { RevitTrayExportBlock } from "@/components/RevitTrayExportBlock";
import { colors } from "@/data/acm";
import type { OrderRecord } from "@/lib/demoData";
import { describeCartLineItem } from "@/lib/describeCartLineItem";
import type { CartItem } from "@/types/cart";

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

function OrderMetaGrid({ order }: { order: OrderRecord }) {
  const address = order.shippingAddress;
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Customer</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500">Name</dt>
            <dd className="text-right font-medium text-gray-900">{order.customerName}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500">Company</dt>
            <dd className="text-right font-medium text-gray-900">{order.companyName}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500">Email</dt>
            <dd className="text-right font-medium text-gray-900">{order.customerEmail}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500">Phone</dt>
            <dd className="text-right font-medium text-gray-900">{order.customerPhone}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Order</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500">Status</dt>
            <dd className="text-right font-medium text-gray-900">{order.status}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500">Created</dt>
            <dd className="text-right font-medium text-gray-900">{order.createdAt}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500">Material</dt>
            <dd className="text-right font-medium text-gray-900">{order.material}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500">Color (summary)</dt>
            <dd className="text-right font-medium text-gray-900">{order.color}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:col-span-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Shipping address</h2>
        <p className="mt-3 text-sm text-gray-900">
          {address.line1}
          {address.line2 ? <><br />{address.line2}</> : null}
          <br />
          {address.city}, {address.state} {address.postalCode}
        </p>
      </div>
    </div>
  );
}

function LineItemCard({
  item,
  index,
  onOpenPreview,
}: {
  item: CartItem;
  index: number;
  onOpenPreview: () => void;
}) {
  const color = colors.find((c) => c.id === item.colorId);
  const imageSrc = swatchImageSrc(color);
  const lineTotal = item.unitPrice * item.quantity;
  const hasTraySpec = Boolean(item.trayBuildSpec?.trim());
  const hasCustomColor = Boolean(item.customColorReference?.trim() || item.customColorSpecFileName?.trim());

  return (
    <li className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 gap-4">
          <div className="flex shrink-0 flex-col gap-2">
            <button
              type="button"
              onClick={onOpenPreview}
              className="group relative block rounded-lg border border-gray-200 bg-[#f4f5f7] text-left shadow-sm transition hover:border-gray-400 hover:shadow focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              aria-label={`Open enlarged 3D preview for line ${index + 1}`}
            >
              {item.previewImageDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- data URL from WebGL capture
                <img src={item.previewImageDataUrl} alt="" className="h-24 w-40 rounded-lg object-cover" />
              ) : (
                <span className="flex h-24 w-40 items-center justify-center px-2 text-center text-[11px] font-medium text-gray-600">
                  3D preview
                </span>
              )}
              <span className="absolute bottom-1 left-1 right-1 rounded bg-black/55 px-1 py-0.5 text-center text-[10px] font-medium text-white opacity-90 backdrop-blur-sm group-hover:bg-black/65">
                Click — zoom &amp; rotate
              </span>
            </button>
            <div className="relative h-10 w-10 overflow-hidden rounded border border-gray-300 bg-gray-100" aria-hidden>
              {imageSrc ? (
                <Image src={imageSrc} alt="" fill className="object-cover" sizes="40px" />
              ) : (
                <div className="h-full w-full" style={{ backgroundColor: color?.swatchHex ?? "#ccc" }} />
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {describeCartLineItem(item)} <span className="text-gray-500">· Line {index + 1}</span>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {item.areaFt2.toFixed(2)} ft² per panel · {formatUSD(item.unitPrice)} per panel
            </p>

            <div className="mt-3">
              <CartItemMeasurementBlock item={item} />
            </div>

            {hasCustomColor ? (
              <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-[14px] text-gray-700">
                <p className="font-medium text-gray-900">Custom color</p>
                {item.customColorReference?.trim() ? (
                  <p className="mt-1 whitespace-pre-wrap">
                    <span className="font-medium text-gray-700">Reference:</span>{" "}
                    {item.customColorReference.trim()}
                  </p>
                ) : null}
                {item.customColorSpecFileName?.trim() ? (
                  <p className="mt-1">
                    <span className="font-medium text-gray-700">Spec PDF:</span>{" "}
                    {item.customColorSpecFileName.trim()}
                  </p>
                ) : null}
              </div>
            ) : null}

            {hasTraySpec ? (
              <details className="mt-3 rounded-lg border border-gray-200 bg-white px-3 py-2">
                <summary className="cursor-pointer text-[13px] font-medium text-gray-900">
                  Fabrication spec (tray / returns)
                </summary>
                <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-md bg-gray-50 p-2 text-[11px] leading-snug text-gray-700">
                  {item.trayBuildSpec}
                </pre>
              </details>
            ) : null}

            {item.boxTraySides?.length ? <RevitTrayExportBlock item={item} /> : null}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-sm text-gray-500">Qty</p>
          <p className="text-lg font-semibold tabular-nums text-gray-900">{item.quantity}</p>
          <p className="mt-2 text-sm text-gray-500">Line total</p>
          <p className="text-lg font-semibold tabular-nums text-gray-900">{formatUSD(lineTotal)}</p>
        </div>
      </div>
    </li>
  );
}

export function PortalOrderDetail({ order }: { order: OrderRecord }) {
  const items = useMemo(() => order.cartLineItems ?? [order.lineItem], [order.cartLineItems, order.lineItem]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0), [items]);
  const totalSqFt = useMemo(() => items.reduce((sum, i) => sum + i.areaFt2 * i.quantity, 0), [items]);

  const [previewItemId, setPreviewItemId] = useState<string | null>(null);
  const previewItem = previewItemId ? items.find((i) => i.id === previewItemId) ?? null : null;

  return (
    <div className="mt-6">
      <PanelPreviewModal item={previewItem} open={previewItemId !== null} onClose={() => setPreviewItemId(null)} />

      <OrderMetaGrid order={order} />

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Line items</h2>
            <p className="mt-1 text-sm text-gray-600">
              {items.length} line{items.length === 1 ? "" : "s"} · {totalSqFt.toFixed(1)} ft² total
            </p>
          </div>
          <p className="text-sm font-semibold text-gray-900">Subtotal: {formatUSD(subtotal)}</p>
        </div>

        <ul className="mt-5 space-y-4">
          {items.map((item, i) => (
            <LineItemCard
              key={item.id}
              item={item}
              index={i}
              onOpenPreview={() => setPreviewItemId(item.id)}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

