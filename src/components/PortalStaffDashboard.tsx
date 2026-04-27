"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PortalStaffOrderControls } from "@/components/PortalStaffOrderControls";
import PortalSubcontractorComplianceForm from "@/components/PortalSubcontractorComplianceForm";
import type { OrderRecord } from "@/lib/demoData";
import {
  PORTAL_ORDER_SECTION_LABEL,
  PORTAL_ORDER_SECTIONS,
  type PortalOrderSection,
} from "@/lib/portalOrderSection";
import type { PortalAccountSummary } from "@/lib/portalPersistence";

type Tab = "orders" | "accounts" | "insurance";

const SECTION_ORDER: PortalOrderSection[] = ["new", "in_production", "finished"];

/** Stable fingerprint so column (portal) + job stage changes trigger refresh for all viewers. */
function ordersBoardSignature(orders: OrderRecord[]): string {
  return orders
    .map((o) => {
      const sec = o.portalSection ?? "new";
      const stage = o.jobStage ?? "ordering";
      return `${o.id}:${sec}:${stage}`;
    })
    .sort()
    .join("|");
}

function ordersBoardSignatureFromPoll(
  rows: Array<{ id: string; portalSection?: string; jobStage?: string }>
): string {
  return rows
    .map((o) => `${o.id}:${o.portalSection ?? "new"}:${o.jobStage ?? "ordering"}`)
    .sort()
    .join("|");
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return iso;
  }
}

function PortalOrdersAutoRefresh({ orders }: { orders: OrderRecord[] }) {
  const router = useRouter();
  const baselineRef = useRef("");

  useEffect(() => {
    baselineRef.current = ordersBoardSignature(orders);
  }, [orders]);

  const check = useCallback(async () => {
    try {
      const res = await fetch("/api/portal/orders", { credentials: "include" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        orders?: Array<{ id: string; portalSection?: string; jobStage?: string }>;
      };
      const next = ordersBoardSignatureFromPoll(data.orders ?? []);
      if (next !== baselineRef.current) {
        baselineRef.current = next;
        router.refresh();
      }
    } catch {
      /* ignore */
    }
  }, [router]);

  useEffect(() => {
    const id = window.setInterval(() => void check(), 20000);
    const onFocus = () => void check();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [check]);

  return null;
}

function PortalOrderSectionMover({ orderId, section }: { orderId: string; section: PortalOrderSection }) {
  const router = useRouter();
  const [sel, setSel] = useState<PortalOrderSection>(section);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSel(section);
  }, [section, orderId]);

  const save = async () => {
    if (sel === section) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/order-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId, section: sel }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not move order.");
        return;
      }
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("Could not reach server. Try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <label className="sr-only" htmlFor={`section-${orderId}`}>
          Order section
        </label>
        <select
          id={`section-${orderId}`}
          value={sel}
          disabled={pending}
          onChange={(e) => setSel(e.target.value as PortalOrderSection)}
          className="max-w-[14rem] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
        >
          {PORTAL_ORDER_SECTIONS.map((s) => (
            <option key={s} value={s}>
              {PORTAL_ORDER_SECTION_LABEL[s]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => void save()}
          disabled={pending || sel === section}
          className="inline-flex items-center justify-center rounded-lg border border-gray-900 bg-white px-3 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Move
        </button>
      </div>
      {error ? (
        <p className="text-right text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function StaffOrderCard({ order }: { order: OrderRecord }) {
  const section = order.portalSection ?? "new";
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm outline-none ring-black transition hover:border-gray-300 hover:shadow-md">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-gray-900">{order.projectName}</h2>
          <p className="text-sm text-gray-500">Order ID: {order.id}</p>
          <p className="text-sm text-gray-500">Customer: {order.customerName}</p>
        </div>

        <div className="flex w-full flex-col gap-3 md:w-auto md:items-end">
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <div className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">{order.status}</div>
            <div className="rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-700 ring-1 ring-gray-200">
              {PORTAL_ORDER_SECTION_LABEL[section]}
            </div>
          </div>
          <PortalOrderSectionMover key={`${order.id}-${section}`} orderId={order.id} section={section} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Width</p>
          <p className="mt-1 text-lg font-semibold">
            {order.measurements.width} {order.measurements.unit}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Height</p>
          <p className="mt-1 text-lg font-semibold">
            {order.measurements.height} {order.measurements.unit}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Depth</p>
          <p className="mt-1 text-lg font-semibold">
            {order.measurements.depth ?? "-"}{" "}
            {order.measurements.depth != null ? order.measurements.unit : ""}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Created</p>
          <p className="mt-1 text-lg font-semibold">{order.createdAt}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Material</p>
          <p className="mt-1 text-base font-semibold">{order.material}</p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Color</p>
          <p className="mt-1 text-base font-semibold">{order.color}</p>
        </div>
      </div>

      <PortalStaffOrderControls order={order} />
    </div>
  );
}

export function PortalStaffDashboard({
  orders,
  accounts,
  showAccountsTab,
  showInsuranceTab,
}: {
  orders: OrderRecord[];
  accounts: PortalAccountSummary[];
  showAccountsTab: boolean;
  showInsuranceTab: boolean;
}) {
  const [tab, setTab] = useState<Tab>("orders");

  useEffect(() => {
    if (!showAccountsTab && tab === "accounts") {
      setTab("orders");
    }
  }, [showAccountsTab, tab]);

  const grouped = useMemo(() => {
    const map: Record<PortalOrderSection, OrderRecord[]> = {
      new: [],
      in_production: [],
      finished: [],
    };
    for (const o of orders) {
      const sec = o.portalSection ?? "new";
      map[sec].push(o);
    }
    for (const sec of SECTION_ORDER) {
      map[sec].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return map;
  }, [orders]);

  const tabBtn = (id: Tab, label: string) => (
    <button
      type="button"
      key={id}
      onClick={() => setTab(id)}
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
        tab === id
          ? "bg-gray-900 text-white"
          : "bg-white text-gray-800 ring-1 ring-gray-200 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {tabBtn("orders", "Orders")}
        {showAccountsTab ? tabBtn("accounts", "Manage accounts") : null}
        {showInsuranceTab ? tabBtn("insurance", "Insurance & license") : null}
      </div>

      {tab === "orders" ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            New checkout orders appear here automatically. Column moves (New / In production / Finished) and job
            stages are saved for everyone: this board refreshes on focus and every 20 seconds so all staff see the same
            view.
          </p>
          <PortalOrdersAutoRefresh orders={orders} />
          <div className="grid gap-6 lg:grid-cols-3">
            {SECTION_ORDER.map((section) => (
              <section key={section} className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-gray-800">
                    {PORTAL_ORDER_SECTION_LABEL[section]}
                  </h3>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-gray-600 ring-1 ring-gray-200">
                    {grouped[section].length}
                  </span>
                </div>
                <div className="grid gap-4">
                  {grouped[section].length === 0 ? (
                    <p className="rounded-xl border border-dashed border-gray-200 bg-white px-3 py-4 text-center text-sm text-gray-500">
                      No orders
                    </p>
                  ) : (
                    grouped[section].map((order) => <StaffOrderCard key={order.id} order={order} />)
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      ) : null}

      {tab === "accounts" && showAccountsTab ? (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-12 gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
            <div className="col-span-4">Name</div>
            <div className="col-span-4">Email</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2 text-right">Created</div>
          </div>
          <ul className="divide-y divide-gray-100">
            {accounts.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/portal/admin/accounts/${encodeURIComponent(a.id)}`}
                  className="grid grid-cols-12 gap-2 px-4 py-3 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <div className="col-span-4 font-medium text-gray-900">{a.name}</div>
                  <div className="col-span-4 truncate text-gray-700">{a.email}</div>
                  <div className="col-span-2 text-gray-700">{a.role}</div>
                  <div className="col-span-2 text-right tabular-nums text-gray-500">{formatDate(a.createdAt)}</div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {tab === "insurance" && showInsuranceTab ? (
        <PortalSubcontractorComplianceForm
          orderSummaries={orders.map((o) => ({ id: o.id, companyName: o.companyName }))}
        />
      ) : null}
    </div>
  );
}
