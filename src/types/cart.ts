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
}

export function cartItemLineTotal(item: CartItem): number {
  return item.unitPrice * item.quantity;
}
