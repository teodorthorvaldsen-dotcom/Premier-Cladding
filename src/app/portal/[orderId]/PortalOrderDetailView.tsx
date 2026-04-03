"use client";

import Link from "next/link";
import { useState } from "react";
import { PanelPreviewModal } from "@/components/PanelPreviewModal";
import PortalEmployeeComplianceForm from "./PortalEmployeeComplianceForm";
import { PortalLogoutButton } from "@/components/PortalLogoutButton";
import { RevitTrayExportBlock } from "@/components/RevitTrayExportBlock";
import { describeCartLineItem } from "@/lib/describeCartLineItem";
import type { OrderRecord } from "@/lib/demoData";
import {
  MATERIAL_LEAD_CALENDAR_DAYS,
  ORDER_FINALIZATION_CALENDAR_DAYS,
  ORDER_PROCESS_STEPS,
  PANELS_PER_PRODUCTION_DAY,
  planOrderTimelineDays,
  SHIPPING_CALENDAR_DAYS,
} from "@/lib/orderProcess";
import { cartItemLineTotal } from "@/types/cart";

function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

function OrderTimelineSection({ orderedQty }: { orderedQty: number }) {
  const timeline = planOrderTimelineDays(orderedQty);
  const t = timeline.totalDays;
  const pct = (days: number) => (t > 0 ? (days / t) * 100 : 0);
  const pFinal = pct(timeline.orderFinalizationDays);
  const pMat = pct(timeline.materialLeadDays);
  const pFab = pct(timeline.fabricationDays);
  const pShip = pct(timeline.shippingDays);
  const minPctLabel = 9;

  return (
    <section className="mt-10 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:p-8">
      <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-500">Estimated timeline</h2>
      <p className="mt-2 text-[14px] text-gray-600">
        Built automatically from your order: <strong>{orderedQty}</strong> panel{orderedQty === 1 ? "" : "s"} at{" "}
        <strong>{PANELS_PER_PRODUCTION_DAY} panels per calendar day</strong>. Includes{" "}
        <strong>{ORDER_FINALIZATION_CALENDAR_DAYS} days</strong> order finalization (quote &amp; sign-off),{" "}
        <strong>{MATERIAL_LEAD_CALENDAR_DAYS} days</strong> to order and receive materials, fabrication time, and{" "}
        <strong>{SHIPPING_CALENDAR_DAYS} days</strong> for shipping.
      </p>

      <div className="mt-6 space-y-3 rounded-xl border border-gray-200 bg-gray-50/80 p-4">
        <p className="text-[12px] font-medium text-gray-700">Hover segments for phase details.</p>
        <div
          className="flex h-11 w-full cursor-help overflow-hidden rounded-lg shadow-inner"
          role="img"
          aria-label="Timeline by phase length"
        >
          <div
            className="flex min-w-0 items-center justify-center bg-slate-700 text-[10px] font-semibold text-white transition-opacity hover:opacity-95"
            style={{ width: `${pFinal}%` }}
            title={`Order finalization: ${timeline.orderFinalizationDays} calendar days (estimate, finalized cost, deposit)`}
          >
            {pFinal >= minPctLabel ? `${timeline.orderFinalizationDays}d` : ""}
          </div>
          <div
            className="flex min-w-0 items-center justify-center bg-slate-600 text-[10px] font-semibold text-white transition-opacity hover:opacity-95"
            style={{ width: `${pMat}%` }}
            title={`Materials: ${timeline.materialLeadDays} calendar days (order & receive at shop)`}
          >
            {pMat >= minPctLabel ? `${timeline.materialLeadDays}d` : ""}
          </div>
          <div
            className="flex min-w-0 items-center justify-center bg-slate-500 text-[10px] font-semibold text-white transition-opacity hover:opacity-95"
            style={{ width: `${pFab}%` }}
            title={`Fabrication: ${timeline.fabricationDays} day${timeline.fabricationDays === 1 ? "" : "s"} (${orderedQty} panels ÷ ${PANELS_PER_PRODUCTION_DAY} per day)`}
          >
            {pFab >= minPctLabel ? `${timeline.fabricationDays}d` : ""}
          </div>
          <div
            className="flex min-w-0 items-center justify-center bg-slate-400 text-[10px] font-semibold text-white transition-opacity hover:opacity-95"
            style={{ width: `${pShip}%` }}
            title={`Shipping: ${timeline.shippingDays} calendar days (transit to you)`}
          >
            {pShip >= minPctLabel ? `${timeline.shippingDays}d` : ""}
          </div>
        </div>
        <ul className="space-y-2 text-[13px] text-gray-800">
          <li>
            <span className="font-medium text-gray-900">Order finalization:</span>{" "}
            {timeline.orderFinalizationDays} calendar days — estimate, inventory check, finalized cost, signature
            &amp; deposit
          </li>
          <li>
            <span className="font-medium text-gray-900">Materials:</span> {timeline.materialLeadDays} calendar days —
            order materials and receive at our shop
          </li>
          <li>
            <span className="font-medium text-gray-900">Fabrication:</span> {timeline.fabricationDays} calendar day
            {timeline.fabricationDays === 1 ? "" : "s"} — {orderedQty} panel{orderedQty === 1 ? "" : "s"} at{" "}
            {PANELS_PER_PRODUCTION_DAY}/day (rounded up)
          </li>
          <li>
            <span className="font-medium text-gray-900">Shipping:</span> {timeline.shippingDays} calendar days — transit
            to your jobsite or address
          </li>
          <li className="border-t border-gray-200 pt-2 text-sm font-semibold text-gray-900">
            End-to-end (illustrative): {timeline.totalDays} calendar day{timeline.totalDays === 1 ? "" : "s"}
          </li>
        </ul>
        <p className="text-[11px] leading-snug text-gray-500">
          Illustrative calendar-day model only — actual dates depend on queue, carrier, and your quote. Confirmed
          schedule is on your written quote.
        </p>
      </div>
    </section>
  );
}

export function PortalOrderDetailView({
  order,
  showCadExport,
  showOrderTimeline,
}: {
  order: OrderRecord;
  /** DXF/CSV export — internal use only; not shown to customer portal logins. */
  showCadExport: boolean;
  /** Estimated timeline — customer-facing only; hidden for employee logins. */
  showOrderTimeline: boolean;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const orderedQty = order.lineItem.quantity;

  const item = order.lineItem;
  const lineTotal = cartItemLineTotal(item);
  const totalSqFt = item.areaFt2 * item.quantity;
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
            <dt className="text-xs uppercase tracking-wide text-gray-500">Company name</dt>
            <dd className="mt-0.5 font-medium text-gray-900">{order.companyName}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Contact name</dt>
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
              <span className="font-medium text-gray-900">{order.companyName}</span>
              <br />
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

      {showCadExport ? <PortalEmployeeComplianceForm orderId={order.id} /> : null}

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

      <section className="mt-10 rounded-2xl border border-gray-200/80 bg-gray-50/50 p-6 md:p-8">
        <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-500">Order process</h2>
        <p className="mt-2 text-[14px] text-gray-600">
          Same steps you see at checkout — from request through fabrication and shipping.
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-4 text-[14px] text-gray-700">
          {ORDER_PROCESS_STEPS.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      {showOrderTimeline ? <OrderTimelineSection orderedQty={orderedQty} /> : null}
    </div>
  );
}
