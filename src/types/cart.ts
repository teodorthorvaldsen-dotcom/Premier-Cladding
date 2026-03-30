import type { PanelBendSpec } from "@/types/panelBend";

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
  /** Folds along panel length (in order from reference edge); informational. */
  panelBends?: PanelBendSpec[];
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
