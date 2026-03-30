/**
 * Sheet metal bend developing (illustrative; confirm against shop standards).
 * Angle in degrees, all lengths in inches. R = inside bend radius, T = material thickness.
 */

export function bendAllowanceInches(
  angleDeg: number,
  insideRadiusIn: number,
  thicknessIn: number,
  kFactor = 0.33
): number {
  const rad = (Math.PI / 180) * angleDeg;
  return rad * (insideRadiusIn + kFactor * thicknessIn);
}

/** BD = 2(R+T)tan(θ/2) − BA (common layout formula). */
export function bendDeductionInches(
  angleDeg: number,
  insideRadiusIn: number,
  thicknessIn: number,
  kFactor = 0.33
): number {
  const ba = bendAllowanceInches(angleDeg, insideRadiusIn, thicknessIn, kFactor);
  const half = (Math.PI / 180) * (angleDeg / 2);
  const tangentLength = 2 * (insideRadiusIn + thicknessIn) * Math.tan(half);
  return tangentLength - ba;
}
