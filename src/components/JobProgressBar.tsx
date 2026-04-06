"use client";

import { JOB_STAGE_LABEL, JOB_STAGE_PROGRESS_PCT, type JobStage } from "@/lib/jobStage";

export function JobProgressBar({ stage }: { stage: JobStage }) {
  const pct = JOB_STAGE_PROGRESS_PCT[stage];
  return (
    <div className="w-full min-w-0">
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-emerald-600 transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Job progress ${pct} percent`}
        />
      </div>
      <p className="mt-1.5 text-xs font-medium text-gray-700">
        {JOB_STAGE_LABEL[stage]} · {pct}%
      </p>
    </div>
  );
}
