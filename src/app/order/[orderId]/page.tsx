"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PanelPreviewModal } from "@/components/PanelPreviewModal";
import type { CartItem } from "@/types/cart";

type PublicCartOrderRecord = {
  id: string;
  createdAt: string;
  fullName: string;
  company: string;
  email: string;
  phone: string;
  projectCity: string;
  projectState: string;
  notes: string;
  paymentMethod: "wire" | "credit";
  signature: string;
  items: Omit<CartItem, \"id\">[];
};

export default function Order3DViewPage() {
  const params = useParams<{ orderId: string }>();
  const search = useSearchParams();
  const token = search.get(\"t\") ?? \"\";
  const orderId = params.orderId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<PublicCartOrderRecord | null>(null);
  const [previewItemId, setPreviewItemId] = useState<string | null>(null);

  const items: CartItem[] = useMemo(() => {
    if (!order) return [];
    return (order.items ?? []).map((i, idx) => ({ ...(i as Omit<CartItem, \"id\">), id: `${order.id}-line-${idx}` }));
  }, [order]);

  const previewItem = useMemo(() => {
    if (!previewItemId) return null;
    return items.find((i) => i.id === previewItemId) ?? null;
  }, [items, previewItemId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/public/cart-order/${encodeURIComponent(orderId)}?t=${encodeURIComponent(token)}`, {
        method: \"GET\",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof json?.error === \"string\" ? json.error : \"Unable to load order.\");
      }
      setOrder(json.order as PublicCartOrderRecord);
    } catch (e) {
      setError(e instanceof Error ? e.message : \"Unable to load order.\");
    } finally {
      setLoading(false);
    }
  }, [orderId, token]);

  useEffect(() => {
    if (!orderId) return;
    void load();
  }, [orderId, load]);

  return (
    <div className=\"mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8\">
      <PanelPreviewModal item={previewItem} open={previewItemId !== null} onClose={() => setPreviewItemId(null)} />

      <div className=\"mb-10\">
        <h1 className=\"text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl\">Order 3D view</h1>
        <p className=\"mt-2 text-[15px] text-gray-500\">
          Use the buttons below to open an interactive 3D preview for each panel. Drag to rotate.
        </p>
      </div>

      {loading ? (
        <div className=\"rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600\">Loading…</div>
      ) : error ? (
        <div className=\"rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700\" role=\"alert\">
          {error}
        </div>
      ) : order ? (
        <>
          <section className=\"mb-8 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]\">
            <h2 className=\"text-[15px] font-medium uppercase tracking-wider text-gray-500\">Order details</h2>
            <dl className=\"mt-4 grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2\">
              <div>
                <dt className=\"text-gray-500\">Request ID</dt>
                <dd className=\"mt-0.5 font-medium text-gray-900\">{order.id}</dd>
              </div>
              <div>
                <dt className=\"text-gray-500\">Submitted</dt>
                <dd className=\"mt-0.5 font-medium text-gray-900\">{order.createdAt}</dd>
              </div>
              <div>
                <dt className=\"text-gray-500\">Name</dt>
                <dd className=\"mt-0.5 font-medium text-gray-900\">{order.fullName}</dd>
              </div>
              <div>
                <dt className=\"text-gray-500\">Email</dt>
                <dd className=\"mt-0.5 font-medium text-gray-900\">{order.email}</dd>
              </div>
              <div>
                <dt className=\"text-gray-500\">Project</dt>
                <dd className=\"mt-0.5 font-medium text-gray-900\">
                  {order.projectCity}, {order.projectState}
                </dd>
              </div>
              <div>
                <dt className=\"text-gray-500\">Payment</dt>
                <dd className=\"mt-0.5 font-medium text-gray-900\">
                  {order.paymentMethod === \"credit\" ? \"Credit card (3% fee)\" : \"Wire transfer\"}
                </dd>
              </div>
            </dl>
          </section>

          <section className=\"rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]\">
            <h2 className=\"text-[15px] font-medium uppercase tracking-wider text-gray-500\">Line items</h2>
            <ul className=\"mt-4 space-y-4\">
              {items.map((item) => (
                <li key={item.id} className=\"rounded-xl border border-gray-200 p-4\">
                  <div className=\"flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between\">
                    <div className=\"min-w-0\">
                      <p className=\"text-sm font-medium text-gray-900\">
                        {item.widthIn}″ × {item.heightIn}″{item.panelTypeLabel ? ` · ${item.panelTypeLabel}` : \"\"}
                      </p>
                      <p className=\"mt-1 text-xs text-gray-500\">
                        Qty {item.quantity} · {item.thicknessId} · {item.finishId} · {item.colorId}
                      </p>
                    </div>
                    <button
                      type=\"button\"
                      onClick={() => setPreviewItemId(item.id)}
                      className=\"inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2.5 text-[14px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2\"
                    >
                      Open 3D view
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}

      <div className=\"mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center\">
        <Link
          href=\"/products/acm-panels\"
          className=\"inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-3.5 text-[15px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2\"
        >
          Go to configurator
        </Link>
        <Link
          href=\"/\"
          className=\"inline-flex items-center justify-center rounded-xl border-2 border-gray-900 bg-white px-6 py-3.5 text-[15px] font-medium text-gray-900 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2\"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

