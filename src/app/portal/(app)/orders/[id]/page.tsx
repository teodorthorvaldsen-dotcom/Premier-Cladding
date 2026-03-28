import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionFromCookies } from "@/lib/portal/session";
import { canAccessOrder, getOrderById } from "@/lib/portal/orders-store";
import { ORDER_STATUS_LABELS } from "@/types/portal";
import type { PortalOrder } from "@/types/portal";
import { EmployeeOrderStatusForm } from "./EmployeeOrderStatusForm";

export const dynamic = "force-dynamic";

function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

type CartDetail = {
  items: Array<{
    widthIn: number;
    heightIn: number;
    quantity: number;
    unitPrice: number;
    panelTypeLabel?: string;
    colorId?: string;
    finishId?: string;
    thicknessId?: string;
  }>;
  paymentMethod?: string;
  notes?: string;
  signature?: string;
};

type QuoteDetail = {
  config?: {
    widthLabel?: string;
    lengthIn?: number;
    thicknessLabel?: string;
    colorName?: string;
    colorCode?: string;
    finishLabel?: string;
    quantity?: number;
    totalSqFt?: number;
    estimatedTotal?: number;
    panelTypeLabel?: string;
  };
  paymentMethod?: string;
  uploadedFilenames?: string[];
};

function CartDetailSection({ order }: { order: PortalOrder }) {
  const p = order.detail as CartDetail;
  if (!p?.items?.length) {
    return <p className="text-sm text-gray-500">No line item data stored for this order.</p>;
  }
  const subtotal = p.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="pb-2 pr-4 font-medium">Size</th>
            <th className="pb-2 pr-4 font-medium">Type</th>
            <th className="pb-2 pr-4 text-right font-medium">Qty</th>
            <th className="pb-2 text-right font-medium">Line total</th>
          </tr>
        </thead>
        <tbody>
          {p.items.map((it, idx) => (
            <tr key={idx} className="border-b border-gray-100">
              <td className="py-2 pr-4">
                {it.widthIn}" × {it.heightIn} in
              </td>
              <td className="py-2 pr-4 text-gray-700">{it.panelTypeLabel ?? "—"}</td>
              <td className="py-2 pr-4 text-right tabular-nums">{it.quantity}</td>
              <td className="py-2 text-right tabular-nums">{formatUSD(it.unitPrice * it.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 font-medium text-gray-900">Subtotal {formatUSD(subtotal)}</p>
      {p.paymentMethod && (
        <p className="mt-2 text-sm text-gray-600">
          Payment: {p.paymentMethod === "credit" ? "Credit card (3% fee)" : "Wire transfer"}
        </p>
      )}
      {p.notes ? (
        <p className="mt-3 text-sm text-gray-700">
          <span className="font-medium text-gray-900">Notes:</span> {p.notes}
        </p>
      ) : null}
    </div>
  );
}

function QuoteDetailSection({ order }: { order: PortalOrder }) {
  const p = order.detail as QuoteDetail;
  const c = p.config;
  if (!c) {
    return <p className="text-sm text-gray-500">No configuration data stored for this order.</p>;
  }
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
      {c.panelTypeLabel && (
        <>
          <dt className="text-gray-500">Panel type</dt>
          <dd className="text-gray-900">{c.panelTypeLabel}</dd>
        </>
      )}
      {c.widthLabel != null && c.lengthIn != null && (
        <>
          <dt className="text-gray-500">Size</dt>
          <dd className="text-gray-900">
            {c.widthLabel} × {c.lengthIn} in
          </dd>
        </>
      )}
      {c.thicknessLabel && (
        <>
          <dt className="text-gray-500">Thickness</dt>
          <dd className="text-gray-900">{c.thicknessLabel}</dd>
        </>
      )}
      {(c.colorName || c.colorCode) && (
        <>
          <dt className="text-gray-500">Color</dt>
          <dd className="text-gray-900">
            {c.colorName} {c.colorCode ? `(${c.colorCode})` : ""}
          </dd>
        </>
      )}
      {c.finishLabel && (
        <>
          <dt className="text-gray-500">Finish</dt>
          <dd className="text-gray-900">{c.finishLabel}</dd>
        </>
      )}
      {c.quantity != null && (
        <>
          <dt className="text-gray-500">Quantity</dt>
          <dd className="text-gray-900">{c.quantity} panels</dd>
        </>
      )}
      {c.totalSqFt != null && (
        <>
          <dt className="text-gray-500">Total sq ft</dt>
          <dd className="text-gray-900">{c.totalSqFt.toFixed(2)} ft²</dd>
        </>
      )}
      {c.estimatedTotal != null && (
        <>
          <dt className="text-gray-500">Estimated total</dt>
          <dd className="text-gray-900 font-medium">{formatUSD(c.estimatedTotal)}</dd>
        </>
      )}
      {p.paymentMethod && (
        <>
          <dt className="text-gray-500">Payment</dt>
          <dd className="text-gray-900">
            {p.paymentMethod === "credit" ? "Credit card (3% fee)" : "Wire transfer"}
          </dd>
        </>
      )}
      {p.uploadedFilenames && p.uploadedFilenames.length > 0 && (
        <>
          <dt className="text-gray-500">Attachments</dt>
          <dd className="text-gray-900">{p.uploadedFilenames.join(", ")}</dd>
        </>
      )}
    </dl>
  );
}

export default async function PortalOrderDetailPage({ params }: { params: { id: string } }) {
  const user = await getSessionFromCookies();
  if (!user) return null;

  const order = await getOrderById(params.id);
  if (!order || !canAccessOrder(user, order)) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/portal"
        className="text-sm font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus-visible:underline"
      >
        ← Back to orders
      </Link>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
        Order details
      </h1>
      <p className="mt-1 font-mono text-sm text-gray-500">{order.id}</p>

      <div className="mt-8 space-y-6">
        {user.role === "employee" && (
          <EmployeeOrderStatusForm orderId={order.id} current={order.status} />
        )}

        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-500">Summary</h2>
          <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-gray-500">Status</dt>
              <dd className="font-medium text-gray-900">{ORDER_STATUS_LABELS[order.status]}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Submitted</dt>
              <dd className="text-gray-900">{formatWhen(order.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Source</dt>
              <dd className="text-gray-900">
                {order.source === "cart_checkout" ? "Cart checkout" : "Panel configurator"}
              </dd>
            </div>
            {order.subtotalUsd != null && (
              <div>
                <dt className="text-gray-500">Total (at submission)</dt>
                <dd className="text-gray-900">{formatUSD(order.subtotalUsd)}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-500">Customer</h2>
          <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-gray-500">Name</dt>
              <dd className="text-gray-900">{order.fullName}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Email</dt>
              <dd className="text-gray-900">{order.customerEmail}</dd>
            </div>
            {order.company ? (
              <div>
                <dt className="text-gray-500">Company</dt>
                <dd className="text-gray-900">{order.company}</dd>
              </div>
            ) : null}
            {order.phone ? (
              <div>
                <dt className="text-gray-500">Phone</dt>
                <dd className="text-gray-900">{order.phone}</dd>
              </div>
            ) : null}
            {(order.projectCity || order.projectState) && (
              <div className="sm:col-span-2">
                <dt className="text-gray-500">Project location</dt>
                <dd className="text-gray-900">
                  {[order.projectCity, order.projectState].filter(Boolean).join(", ")}
                </dd>
              </div>
            )}
            {order.notes ? (
              <div className="sm:col-span-2">
                <dt className="text-gray-500">Notes</dt>
                <dd className="text-gray-900">{order.notes}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-500">
            {order.source === "cart_checkout" ? "Line items" : "Configuration"}
          </h2>
          <div className="mt-4">
            {order.source === "cart_checkout" ? (
              <CartDetailSection order={order} />
            ) : (
              <QuoteDetailSection order={order} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
