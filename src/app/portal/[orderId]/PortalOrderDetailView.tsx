"use client";

import Link from "next/link";
import { useState } from "react";
import { PanelPreviewModal } from "@/components/PanelPreviewModal";
import { PortalLogoutButton } from "@/components/PortalLogoutButton";
import { RevitTrayExportBlock } from "@/components/RevitTrayExportBlock";
import { describeCartLineItem } from "@/lib/describeCartLineItem";
import type { OrderRecord } from "@/lib/demoData";
import { cartItemLineTotal } from "@/types/cart";

function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

export function PortalOrderDetailView({
  order,
  showCadExport,
}: {
  order: OrderRecord;
  /** DXF/CSV export — internal use only; not shown to customer portal logins. */
  showCadExport: boolean;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const item = order.lineItem;
  const lineTotal = cartItemLineTotal(item);
  const totalSqFt = item.areaFt2 * item.quantity;
  const cad = order.cadMeasurements;
  const thumbSrc = item.previewImageDataUrl ?? order.previewImageSrc;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <PanelPreviewModal item={item} open={previewOpen} onClose={() => setPreviewOpen(false)} />

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/portal"
          className="text-sm font-medium text-gray-700 underline-offset-4 hover:text-gray-900 hover:underline"
        >
          ← Back to orders
        </Link>
        <PortalLogoutButton />
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">{order.projectName}</h1>
        <p className="mt-2 text-[15px] text-gray-600">
          Order <span className="font-medium text-gray-900">{order.id}</span> · {order.status} · Placed{" "}
          {order.createdAt}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          {order.material} · {order.color}
        </p>
      </div>

      <section className="mb-10 rounded-2xl border border-gray-200/80 bg-gray-50/50 p-6 md:p-8">
        <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-500">Customer &amp; shipping</h2>
        <dl className="mt-4 space-y-3 text-[14px] text-gray-800">
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Name</dt>
            <dd className="mt-0.5 font-medium text-gray-900">{order.customerName}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Email</dt>
            <dd className="mt-0.5">
              <a className="text-gray-900 underline-offset-2 hover:underline" href={`mailto:${order.customerEmail}`}>
                {order.customerEmail}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Phone</dt>
            <dd className="mt-0.5">{order.customerPhone}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Ship to</dt>
            <dd className="mt-0.5">
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? (
                <>
                  <br />
                  {order.shippingAddress.line2}
                </>
              ) : null}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-500">Order summary</h2>
          <p className="text-lg font-semibold tabular-nums text-gray-900">{formatUSD(lineTotal)}</p>
        </div>

        <ul className="mt-4 space-y-6">
          <li className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="group relative shrink-0 rounded-lg border border-gray-200 bg-[#f4f5f7] text-left shadow-sm transition hover:border-gray-400 hover:shadow focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  aria-label="Open enlarged 3D preview — drag to rotate"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- data URL or static path */}
                  <img
                    src={thumbSrc}
                    alt=""
                    className="h-28 w-44 rounded-lg object-cover"
                  />
                  <span className="absolute bottom-1 left-1 right-1 rounded bg-black/55 px-1 py-0.5 text-center text-[10px] font-medium text-white backdrop-blur-sm">
                    Click — zoom &amp; rotate
                  </span>
                </button>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {describeCartLineItem(item)} <span className="text-gray-500">× {item.quantity}</span>
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {item.areaFt2.toFixed(2)} ft² per panel · {formatUSD(item.unitPrice)} per panel
                  </p>
                  {item.trayBuildSpec ? (
                    <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-md bg-gray-50 p-2 font-mono text-[11px] leading-snug text-gray-700">
                      {item.trayBuildSpec}
                    </pre>
                  ) : null}

                  <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50/90 p-3">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">
                      Flat pattern (CAD schedule)
                    </h3>
                    <p className="mt-1 text-[11px] text-gray-600">
                      Nominal {cad.nominal.widthIn} × {cad.nominal.heightIn} {cad.nominal.unit}
                      {cad.nominal.depthIn != null ? ` · return depth ${cad.nominal.depthIn} ${cad.nominal.unit}` : ""} ·{" "}
                      {cad.thicknessMm} mm core · DXF units: {cad.dxfUnits}
                    </p>
                    <p className="mt-2 text-[11px] text-gray-600">
                      Bounding blank: {cad.flatPattern.boundingWidthIn} × {cad.flatPattern.boundingLengthIn} in (overall)
                    </p>
                    <div className="mt-2 overflow-x-auto rounded-md border border-gray-200 bg-white">
                      <table className="min-w-full text-left font-mono text-[10px] leading-tight text-gray-800">
                        <thead className="bg-gray-100 text-[9px] uppercase tracking-wide text-gray-600">
                          <tr>
                            <th className="px-2 py-1.5 font-medium">Feature</th>
                            <th className="px-2 py-1.5 font-medium">in</th>
                            <th className="px-2 py-1.5 font-medium">°</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {cad.flatPattern.segments.map((row, i) => (
                            <tr key={`${row.label}-${i}`}>
                              <td className="px-2 py-1.5">{row.label}</td>
                              <td className="px-2 py-1.5 tabular-nums">{row.lengthIn}</td>
                              <td className="px-2 py-1.5 text-gray-600">
                                {row.angleDeg != null ? row.angleDeg : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {cad.flatPattern.notes?.length ? (
                      <ul className="mt-2 list-disc space-y-0.5 pl-4 text-[10px] text-gray-600">
                        {cad.flatPattern.notes.map((n) => (
                          <li key={n}>{n}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>

                  {showCadExport ? <RevitTrayExportBlock item={item} /> : null}
                </div>
              </div>
            </div>
            <p className="shrink-0 text-right text-sm font-medium tabular-nums text-gray-900 sm:pt-1">
              {formatUSD(lineTotal)}
            </p>
          </li>
        </ul>

        <p className="mt-4 border-t border-gray-100 pt-4 text-sm font-semibold text-gray-900">
          Subtotal: {formatUSD(lineTotal)} · {totalSqFt.toFixed(1)} ft² total
        </p>
        <p className="mt-2 text-[14px] text-gray-500">
          Final cost will be confirmed in your written quote after we check inventory and prepare the estimate.
        </p>
      </section>
    </div>
  );
}
