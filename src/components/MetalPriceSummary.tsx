"use client";

import type { FC } from "react";

interface MetalPriceSummaryProps {
  hasEstimate: boolean;
  isQuoteOnly: boolean;
  systemLabel: string;
  totalSqFt: number;
  pricePerSqFt: number;
  materialSubtotal: number;
  laborSubtotal: number;
  /** Optional line under the selected system, e.g. attachment type. */
  attachmentLabel?: string;
}

function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

export const MetalPriceSummary: FC<MetalPriceSummaryProps> = ({
  hasEstimate,
  isQuoteOnly,
  systemLabel,
  totalSqFt,
  pricePerSqFt,
  materialSubtotal,
  laborSubtotal,
  attachmentLabel,
}) => {
  const total = materialSubtotal + laborSubtotal;

  return (
    <section
      className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:p-6"
      aria-labelledby="metal-estimate-heading"
    >
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h2
            id="metal-estimate-heading"
            className="text-[13px] font-medium uppercase tracking-wider text-gray-500"
          >
            Budgetary estimate
          </h2>
          <p className="mt-0.5 text-[13px] text-gray-500">
            High-level pricing reference for this configuration.
          </p>
        </div>
        {hasEstimate && !isQuoteOnly && (
          <p className="text-right text-xs font-medium text-gray-500">
            {totalSqFt.toFixed(0)} ft²
          </p>
        )}
      </div>

      {!hasEstimate && !isQuoteOnly && (
        <p className="mt-4 text-sm text-gray-600">
          Enter at least <span className="font-medium">10 ft²</span> of wall area to see a budgetary estimate.
        </p>
      )}

      {isQuoteOnly && (
        <div className="mt-4 rounded-xl bg-amber-50/80 px-4 py-3">
          <p className="text-sm font-medium text-amber-900">
            Quote only configuration
          </p>
          <p className="mt-1 text-[13px] text-amber-900/90">
            Specialty / custom systems are reviewed project-by-project. Share your drawings and we&apos;ll confirm
            system selection, detailing, and pricing with a formal quote.
          </p>
        </div>
      )}

      {hasEstimate && !isQuoteOnly && (
        <div className="mt-5 space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Selected system
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {systemLabel}
            </p>
            {attachmentLabel && (
              <p className="mt-0.5 text-[12px] text-gray-600">
                {attachmentLabel}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Estimated price / ft²</p>
              <p className="mt-0.5 text-base font-semibold text-gray-900">
                {formatUSD(pricePerSqFt)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Total area</p>
              <p className="mt-0.5 text-base font-semibold text-gray-900">
                {totalSqFt.toFixed(0)} ft²
              </p>
            </div>
          </div>

          <div className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between text-gray-600">
              <span>Material subtotal</span>
              <span className="font-medium text-gray-900">
                {formatUSD(materialSubtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-gray-600">
              <span>Labor subtotal</span>
              <span className="font-medium text-gray-900">
                {formatUSD(laborSubtotal)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-sm font-semibold text-gray-900">
                Estimated total
              </span>
              <span className="text-base font-semibold text-gray-900">
                {formatUSD(total)}
              </span>
            </div>
          </div>
        </div>
      )}

      <p className="mt-4 border-t border-gray-100 pt-3 text-[12px] leading-relaxed text-gray-500">
        <span className="font-medium text-gray-600">Important:</span> This is a budgetary estimate only. Final
        pricing, lead times, and system details will be confirmed after our team reviews your drawings and issues
        a written quote.
      </p>
    </section>
  );
};

