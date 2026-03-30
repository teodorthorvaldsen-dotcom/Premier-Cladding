import type { SizeSelection } from "@/components/SizePicker";

/** Smallest allowed main (flat) face on the preview so the panel stays valid. */
const MIN_MAIN_FACE_IN = 1;
const FOLD_ANGLE = 90;

export function sizeSelectionToFoldPreview(size: SizeSelection) {
  const maxRight = Math.max(0, size.widthIn - MIN_MAIN_FACE_IN);
  const maxTop = Math.max(0, size.lengthIn - MIN_MAIN_FACE_IN);

  const rightD =
    size.rightReturnIn == null
      ? 0
      : Math.min(Math.max(size.rightReturnIn, 0), maxRight);
  const topD =
    size.topReturnIn == null ? 0 : Math.min(Math.max(size.topReturnIn, 0), maxTop);

  return {
    topFold:
      topD > 0 ? { depth: topD, angle: FOLD_ANGLE } : { depth: 0, angle: 0 },
    rightFold:
      rightD > 0 ? { depth: rightD, angle: FOLD_ANGLE } : { depth: 0, angle: 0 },
    bottomFold: { depth: 0, angle: 0 },
    leftFold: { depth: 0, angle: 0 },
  };
}
