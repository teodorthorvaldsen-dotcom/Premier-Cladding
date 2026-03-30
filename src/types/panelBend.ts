export interface PanelBendSpec {
  /** Inches from the reference edge to this fold line, along panel length (hinge parallel to width). */
  inchesFromEdge: number;
  /** Included angle between the leg before and after this fold (0–180°). */
  angleDeg: number;
}
