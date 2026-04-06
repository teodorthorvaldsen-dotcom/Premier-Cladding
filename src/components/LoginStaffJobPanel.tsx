"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { JobProgressBar } from "@/components/JobProgressBar";
import { JOB_STAGE_LABEL, JOB_STAGES, type JobStage } from "@/lib/jobStage";

type Row = { id: string; projectName: string; jobStage: JobStage };

export function LoginStaffJobPanel() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await fetch("/api/portal/session", { credentials: "include" }).then((r) => r.json() as Promise<{ user: { role?: string } | null }>);
        if (cancelled) return;
        const role = s.user?.role;
        const staff =
          role === "admin" || role === "subcontractor" || role === "employee";
        if (!staff) {
          setVisible(false);
          setLoading(false);
          return;
        }
        setVisible(true);
        const o = await fetch("/api/portal/orders", { credentials: "include" }).then((r) => r.json() as Promise<{ orders?: Array<{ id: string; projectName: string; jobStage?: JobStage }> }>);
        if (cancelled) return;
        const list = o.orders ?? [];
        setRows(
          list.map((x) => ({
            id: x.id,
            projectName: x.projectName,
            jobStage: x.jobStage ?? "ordering",
          }))
        );
      } catch {
        if (!cancelled) {
          setVisible(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onStageChange(orderId: string, stage: JobStage) {
    setRows((prev) => prev.map((r) => (r.id === orderId ? { ...r, jobStage: stage } : r)));
    try {
      const res = await fetch("/api/portal/order-job-stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, stage }),
      });
      if (!res.ok) {
        router.refresh();
        return;
      }
      router.refresh();
    } catch {
      router.refresh();
    }
  }

  if (loading || !visible) {
    return null;
  }

  return (
    <div className="mx-auto mt-12 max-w-5xl px-6 pb-16">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-gray-900">Staff: job progress</h2>
        <p className="mt-2 text-sm text-gray-600">
          Signed-in subcontractors and admins can set each order to Ordering, Building, Shipping, or Complete. The bar shows
          the matching completion percentage (for example, Shipping = 75%).
        </p>

        {rows.length === 0 ? (
          <p className="mt-6 text-sm text-gray-600">No orders are available to update yet.</p>
        ) : (
          <ul className="mt-6 space-y-8">
            {rows.map((row) => (
              <li key={row.id} className="border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{row.projectName}</p>
                    <p className="text-sm text-gray-500">{row.id}</p>
                  </div>
                  <select
                    value={row.jobStage}
                    onChange={(e) => void onStageChange(row.id, e.target.value as JobStage)}
                    className="max-w-xs rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    {JOB_STAGES.map((s) => (
                      <option key={s} value={s}>
                        {JOB_STAGE_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-4 max-w-lg">
                  <JobProgressBar stage={row.jobStage} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
