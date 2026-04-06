export type JobStage = "ordering" | "building" | "shipping" | "complete";

export type LegacyOrderStatus = "Pending" | "In Production" | "Completed" | "Shipped";

export const JOB_STAGES: JobStage[] = ["ordering", "building", "shipping", "complete"];

export const JOB_STAGE_LABEL: Record<JobStage, string> = {
  ordering: "Ordering",
  building: "Building",
  shipping: "Shipping",
  complete: "Complete",
};

/** Progress bar fill for each stage (e.g. Shipping = 75%). */
export const JOB_STAGE_PROGRESS_PCT: Record<JobStage, number> = {
  ordering: 25,
  building: 50,
  shipping: 75,
  complete: 100,
};

export function defaultJobStageFromLegacyStatus(status: LegacyOrderStatus): JobStage {
  switch (status) {
    case "Pending":
      return "ordering";
    case "In Production":
      return "building";
    case "Shipped":
      return "shipping";
    case "Completed":
      return "complete";
    default:
      return "ordering";
  }
}

export function resolveJobStage(
  order: { status: LegacyOrderStatus; jobStage?: JobStage },
  persisted?: JobStage | null
): JobStage {
  if (persisted) return persisted;
  if (order.jobStage) return order.jobStage;
  return defaultJobStageFromLegacyStatus(order.status);
}
