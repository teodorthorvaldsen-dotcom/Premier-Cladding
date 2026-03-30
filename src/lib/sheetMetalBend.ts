/**
 * Sheet metal bend development (illustrative — confirm with shop standards).
 * Angle in degrees; lengths and radii in inches. R = inside bend radius; T = material thickness.
 */

const degToRad = (deg: number) => (deg * Math.PI) / 180;

/** Bend allowance: arc length along neutral axis. */
export function bendAllowanceInches(
  angleDeg: number,
  insideRadiusIn: number,
  thicknessIn: number,
  kFactor = 0.33
): number {
  const θ = degToRad(angleDeg);
  return θ * (insideRadiusIn + kFactor * thicknessIn);
}

export function bendSetbackInches(
  angleDeg: number,
  insideRadiusIn: number,
  thicknessIn: number
): number {
  const θ = degToRad(angleDeg);
  const half = θ / 2;
  if (Math.abs(Math.tan(half)) < 1e-9) return 0;
  return (insideRadiusIn + thicknessIn) * Math.tan(half);
}

/** Bend deduction for flat layout (outside dimension basis — illustrative). */
export function bendDeductionInches(
  angleDeg: number,
  insideRadiusIn: number,
  thicknessIn: number,
  kFactor = 0.33
): number {
  const sb = bendSetbackInches(angleDeg, insideRadiusIn, thicknessIn);
  const ba = bendAllowanceInches(angleDeg, insideRadiusIn, thicknessIn, kFactor);
  return 2 * sb - ba;
}

/** Solve inside radius from target bend allowance (same θ, k, T). */
export function insideRadiusFromBendAllowance(
  targetBA: number,
  angleDeg: number,
  thicknessIn: number,
  kFactor = 0.33
): number {
  const θ = degToRad(angleDeg);
  if (θ < 1e-9) return 0;
  return Math.max(0, targetBA / θ - kFactor * thicknessIn);
}
