"use client";

import Link from "next/link";
import { useState } from "react";
import { PortalStaffOrderControls } from "@/components/PortalStaffOrderControls";
import PortalSubcontractorComplianceForm from "@/components/PortalSubcontractorComplianceForm";
import type { OrderRecord } from "@/lib/demoData";
import type { PortalAccountSummary } from "@/lib/portalPersistence";

type Tab = "orders" | "accounts" | "insurance";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return iso;
  }
}

export function PortalStaffDashboard({
  orders,
  accounts,
  showInsuranceTab,
}: {
  orders: OrderRecord[];
  accounts: PortalAccountSummary[];
  showInsuranceTab: boolean;
}) {
  const [tab, setTab] = useState<Tab>("orders");

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
        {tabBtn("accounts", "Manage accounts")}
        {showInsuranceTab ? tabBtn("insurance", "Insurance & license") : null}
      </div>

      {tab === "orders" ? (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm outline-none ring-black transition hover:border-gray-300 hover:shadow-md"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{order.projectName}</h2>
                  <p className="text-sm text-gray-500">Order ID: {order.id}</p>
                  <p className="text-sm text-gray-500">Customer: {order.customerName}</p>
                </div>

                <div className="flex flex-col items-start gap-2 md:items-end">
                  <div className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                    {order.status}
                  </div>
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
          ))}
        </div>
      ) : null}

      {tab === "accounts" ? (
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
        <PortalSubcontractorComplianceForm orderIds={orders.map((o) => o.id)} />
      ) : null}
    </div>
  );
}
