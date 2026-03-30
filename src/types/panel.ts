/**
 * Barrel re-exports for panel / fold configuration types.
 * Axis (length vs width) is modeled by separate arrays (`bends` vs `bendsAlongWidth`);
 * `BendReferenceAlong` is only which end of that edge you measure from.
 */
export type { BendReferenceAlong, PanelBendSpec } from "./panelBend";
