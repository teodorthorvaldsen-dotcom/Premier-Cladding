"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { JobProgressBar } from "@/components/JobProgressBar";
import type { OrderRecord } from "@/lib/demoData";
import { JOB_STAGE_LABEL, JOB_STAGES, type JobStage } from "@/lib/jobStage";

export function PortalStaffOrderControls({ order }: { order: OrderRecord }) {
  const router = useRouter();
  const stage = order.jobStage ?? "ordering";

  return (
    <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          View stage page
        </label>
        <select
          value={stage}
          onChange={(e) => {
            const next = e.target.value as JobStage;
            router.push(`/portal?stage=${encodeURIComponent(next)}`);
          }}
          className="max-w-xs rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
        >
          {JOB_STAGES.map((s) => (
            <option key={s} value={s}>
              {JOB_STAGE_LABEL[s]}
            </option>
          ))}
        </select>
      </div>
      <JobProgressBar stage={stage} />
      <Link
        href={`/portal/${encodeURIComponent(order.id)}`}
        className="inline-block text-sm font-medium text-gray-900 underline-offset-2 hover:underline"
      >
        Open order details →
      </Link>
    </div>
  );
}
