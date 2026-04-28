import type { PanelBendSpec } from "@/types/panelBend";
import type { BoxTraySideRow } from "@/types/boxTray";

export interface CartItem {
  id: string;
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
  /** For ACM "with extrusions" selection: requested number of clips. */
  clipsNeeded?: number;
  /** Folds along panel length (in order from reference edge); informational. */
  panelBends?: PanelBendSpec[];
  /** Folds along panel width (hinge parallel to length); informational. */
  panelBendsAlongWidth?: PanelBendSpec[];
  /** Tray / box returns (fixed center W×L); informational. */
  boxTraySides?: BoxTraySideRow[];
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
