import type { PanelBendSpec } from "@/types/panelBend";
import type { BoxTraySideRow } from "@/types/boxTray";

export interface CartItem {
  id: string;
  /** Product family for display + pricing context. */
  productKind?: "acm" | "flashing";
  productLabel?: string;
  widthIn: number;
  heightIn: number;
  standardId: string | null;
  colorId: string;
  finishId: string;
  thicknessId: string;
  quantity: number;
  unitPrice: number;
  areaFt2: number;
  panelType?: string;
  panelTypeLabel?: string;
  /**
   * Clips selection (ACM "with extrusions").
   * - `clipsPerPanel`: requested clips per panel.
   * - `clipsNeeded`: total clips requested for the line (kept for backward compatibility).
   */
  clipsPerPanel?: number;
  clipsNeeded?: number;
  /** Folds along panel length (in order from reference edge); informational. */
  panelBends?: PanelBendSpec[];
  /** Folds along panel width (hinge parallel to length); informational. */
  panelBendsAlongWidth?: PanelBendSpec[];
  /** Tray / box returns (fixed center W×L); informational. */
  boxTraySides?: BoxTraySideRow[];
  /** Flashing only: hem at the free edge (after the last fold). */
  hemType?: "none" | "open" | "closed";
  /** Flashing only: hem size (in). */
  hemSizeIn?: number;
  /** Multi-line spec for fabrication (edges, returns, angles, parent chain). */
  trayBuildSpec?: string;
  /** data:image/jpeg;base64,... 3D preview snapshot when added to cart. */
  previewImageDataUrl?: string;
  /** @deprecated Prefer panelBends; kept for older cart JSON. */
  bendAngleDeg?: number;
  bendInchesFromEdge?: number;
  /** Set when color is custom match: manufacturer code, Pantone, or other reference. */
  customColorReference?: string;
  /** Original filename if user attached a PDF (file is not stored in the cart). */
  customColorSpecFileName?: string;
}

export function cartItemLineTotal(item: CartItem): number {
  return item.unitPrice * item.quantity;
}
