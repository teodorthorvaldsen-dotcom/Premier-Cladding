export interface PanelBendSpec {
  /** Inches from the reference edge to this fold line, along panel length (hinge parallel to width). */
  inchesFromEdge: number;
  /**
   * Bend in degrees: **positive** rotates the next leg outward (+Z in the preview); **negative** rotates inward (−Z).
   * Length-axis folds hinge along **X**; width-axis along **Y**. Range −180…180; ~0° or ~±180° is collinear (flat).
   */
  angleDeg: number;
}
