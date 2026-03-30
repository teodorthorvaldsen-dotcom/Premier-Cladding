/**
 * Helpers for ACM bend preview (illustrative — confirm with shop tooling).
 * Neutral-axis radius uses inside bend radius + K-factor × thickness.
 */

const DEG_TO_RAD = Math.PI / 180;

export function neutralRadiusInches(insideRadiusIn: number, thicknessIn: number, kFactor = 0.33): number {
  return Math.max(0, insideRadiusIn + kFactor * thicknessIn);
}

/** Bend allowance (arc length along neutral axis), inches. */
export function bendAllowanceFromAngleInches(
  bendAngleDeg: number,
  insideRadiusIn: number,
  thicknessIn: number,
  kFactor = 0.33
): number {
  const θ = bendAngleDeg * DEG_TO_RAD;
  const rn = neutralRadiusInches(insideRadiusIn, thicknessIn, kFactor);
  return θ * rn;
}

/** Heuristic inside radius for preview when tooling is unknown. */
export function defaultInsideBendRadiusInches(totalThicknessIn: number): number {
  return Math.max(1 / 16, totalThicknessIn * 2);
}
