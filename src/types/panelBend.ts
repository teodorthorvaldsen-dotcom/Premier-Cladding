/** Which end of the panel the distance is measured from along this bend’s axis (length or width). */
export type BendReferenceAlong = "fromStart" | "fromEnd";

export interface PanelBendSpec {
  /**
   * Inches from the chosen reference edge to this fold line (along length or width depending on which list the bend is in).
   */
  inchesFromEdge: number;
  /** Included angle between the leg before and after this fold (0–180°). */
  angleDeg: number;
  /** Edge to measure `inchesFromEdge` from. Defaults to start (0″ side along that dimension in the preview). */
  referenceAlong?: BendReferenceAlong;
}
