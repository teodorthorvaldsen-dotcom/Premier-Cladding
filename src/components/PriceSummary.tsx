"use client";

import type { PriceResult } from "./Configurator";

interface PriceSummaryProps {
  pricing: PriceResult | null;
  loading?: boolean;
  error?: string | null;
  /** Denser card for configurator sidebar (fits with preview without inner scroll) */
  compact?: boolean;
}

function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}

export function PriceSummary({
  pricing,
  loading = false,
  error = null,
  compact = false,
}: PriceSummaryProps) {
  const cardBase = "rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]";
  const bodyBase = compact ? "p-4" : "p-6";

  if (error) {
    return (
      <div className={cardBase}>
        <div className={bodyBase}>
          <p className="text-sm text-red-600" role="alert">{error}</p>
          <p className="mt-1 text-[13px] text-gray-500">Check your options and try again.</p>
        </div>
      </div>
    );
  }

  if (loading && !pricing) {
    return (
      <div className={cardBase}>
        <div className={bodyBase}>
          <p className="text-[15px] text-gray-500">Updating price…</p>
        </div>
      </div>
    );
  }

  if (!pricing) {
    return (
      <div className={cardBase}>
        <div className={bodyBase}>
          <p className="text-[15px] text-gray-500">Configure size and options to see pricing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cardBase}>
      <div className={bodyBase}>
        {loading && (
          <p className={compact ? "mb-2 text-[12px] text-gray-500" : "mb-4 text-[13px] text-gray-500"} aria-live="polite">
            Updating price…
          </p>
        )}
        {pricing.panelType !== "custom" && (
          <div className={compact ? "mb-3" : "mb-6"}>
            <p
              className={
                compact
                  ? "text-xl font-semibold tabular-nums tracking-tight text-gray-900 sm:text-2xl"
                  : "text-[28px] font-semibold tabular-nums tracking-tight text-gray-900"
              }
            >
              {formatUSD(pricing.pricePerSqFt)}{" "}
              <span className={compact ? "text-sm font-medium text-gray-600" : "text-base font-medium text-gray-600"}>
                / sq ft
              </span>
            </p>
          </div>
        )}
        <dl className={compact ? "space-y-2 text-[13px]" : "space-y-3.5 text-[15px]"}>
          <div className="flex justify-between gap-2">
            <dt className="shrink-0 text-gray-600">Panel type</dt>
            <dd className="min-w-0 text-right tabular-nums text-gray-900">{pricing.panelTypeLabel}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Total sq ft</dt>
            <dd className="tabular-nums">{pricing.totalSqFt.toFixed(2)} ft²</dd>
          </div>
          <div
            className={
              compact
                ? "flex justify-between border-t border-gray-200 pt-2.5"
                : "flex justify-between border-t border-gray-200 pt-4"
            }
          >
            <dt className="font-semibold text-gray-900">Estimated total</dt>
            <dd className={compact ? "text-lg font-bold tabular-nums text-gray-900" : "text-xl font-bold tabular-nums text-gray-900"}>
              {formatUSD(pricing.total)}
            </dd>
          </div>
        </dl>
        <p className={compact ? "mt-2 text-[10px] leading-snug text-gray-500" : "mt-4 text-[12px] leading-relaxed text-gray-500"}>
          Pricing shown is preliminary and subject to change. Final quote will be confirmed after drawing review and verification of material cost from supplier.
        </p>
      </div>
    </div>
  );
}
