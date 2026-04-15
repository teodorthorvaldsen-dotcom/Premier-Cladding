"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { JobProgressBar } from "@/components/JobProgressBar";
import type { OrderRecord } from "@/lib/demoData";
import { JOB_STAGE_LABEL, JOB_STAGES, type JobStage } from "@/lib/jobStage";

export function PortalStaffOrderControls({ order }: { order: OrderRecord }) {
  const router = useRouter();
  const initialStage = order.jobStage ?? "ordering";
  const [stage, setStage] = useState<JobStage>(initialStage);
  const [savedStage, setSavedStage] = useState<JobStage>(initialStage);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setStage(initialStage);
    setSavedStage(initialStage);
  }, [initialStage]);

  async function onSave() {
    if (stage === savedStage) return;
    setError("");
    setPending(true);
    try {
      const res = await fetch("/api/portal/order-job-stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, stage }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Update failed.");
        return;
      }
      setSavedStage(stage);
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Job stage
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <select
            value={stage}
            disabled={pending}
            onChange={(e) => setStage(e.target.value as JobStage)}
            className="max-w-xs rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
          >
            {JOB_STAGES.map((s) => (
              <option key={s} value={s}>
                {JOB_STAGE_LABEL[s]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void onSave()}
            disabled={pending || stage === savedStage}
            className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>
      <JobProgressBar stage={stage} />
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <Link
        href={`/portal/${encodeURIComponent(order.id)}`}
        className="inline-block text-sm font-medium text-gray-900 underline-offset-2 hover:underline"
      >
        Open order details →
      </Link>
    </div>
  );
}
