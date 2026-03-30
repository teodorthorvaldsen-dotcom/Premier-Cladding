import type { SizeSelection } from "@/components/SizePicker";

const MIN_MAIN_FACE_IN = 1;
const FOLD_ANGLE = 90;

/** Max combined left+right leg depth so a flat center strip remains. */
export function maxChannelReturnsSum(widthIn: number): number {
  return Math.max(0, widthIn - MIN_MAIN_FACE_IN);
}

export function sizeSelectionToFoldPreview(size: SizeSelection) {
  const maxSum = maxChannelReturnsSum(size.widthIn);
  let leftD = size.leftReturnIn ?? 0;
  let rightD = size.rightReturnIn ?? 0;
  if (leftD <= 0 && rightD <= 0) {
    return {
      topFold: { depth: 0, angle: 0 },
      bottomFold: { depth: 0, angle: 0 },
      leftFold: { depth: 0, angle: 0 },
      rightFold: { depth: 0, angle: 0 },
    };
  }
  const sum = leftD + rightD;
  if (sum > maxSum && maxSum > 0) {
    const s = maxSum / sum;
    leftD *= s;
    rightD *= s;
  }
  if (maxSum <= 0) {
    leftD = 0;
    rightD = 0;
  }

  return {
    topFold: { depth: 0, angle: 0 },
    bottomFold: { depth: 0, angle: 0 },
    leftFold:
      leftD > 0.01 ? { depth: leftD, angle: FOLD_ANGLE } : { depth: 0, angle: 0 },
    rightFold:
      rightD > 0.01 ? { depth: rightD, angle: FOLD_ANGLE } : { depth: 0, angle: 0 },
  };
}
