export type PanelType = "basic" | "basic-no-extrusions" | "tray";

const PRICE_PER_SQFT_BASIC = 24;
const PRICE_PER_SQFT_TRAY = 40; // estimate provided with final quote

export interface PricingInput {
  areaFt2: number;
  quantity: number;
  panelType: PanelType;
}

export interface PricingResult {
  areaFt2: number;
  totalSqFt: number;
  pricePerSqFt: number;
  total: number;
  panelType: PanelType;
  panelTypeLabel: string;
}

const PANEL_TYPE_LABELS: Record<PanelType, string> = {
  basic: "Basic Rectangular with Extrusions",
  "basic-no-extrusions": "Basic Rectangular without Extrusions",
  tray: "Custom Shape",
};

export function calculatePricing(input: PricingInput): PricingResult {
  const totalSqFt = input.areaFt2 * input.quantity;
  const pricePerSqFt =
    input.panelType === "tray" ? PRICE_PER_SQFT_TRAY : PRICE_PER_SQFT_BASIC;
  const total = totalSqFt * pricePerSqFt;

  return {
    areaFt2: input.areaFt2,
    totalSqFt,
    pricePerSqFt,
    total,
    panelType: input.panelType,
    panelTypeLabel: PANEL_TYPE_LABELS[input.panelType],
  };
}
