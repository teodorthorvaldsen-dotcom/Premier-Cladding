export type PanelType = "basic" | "basic-no-extrusions" | "tray";

const PRICE_PER_SQFT_BASIC = 24;
const PRICE_PER_SQFT_BASIC_NO_EXTRUSIONS = 24;
const PRICE_PER_SQFT_TRAY = 40; // estimate provided with final quote
const FLASHING_PRICE_PER_SQFT_BASIC = 2;

export interface PricingInput {
  areaFt2: number;
  quantity: number;
  panelType: PanelType;
  productKind?: "acm" | "flashing";
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
  const kind = input.productKind === "flashing" ? "flashing" : "acm";
  const pricePerSqFt = (() => {
    switch (input.panelType) {
      case "basic":
        return kind === "flashing" ? FLASHING_PRICE_PER_SQFT_BASIC : PRICE_PER_SQFT_BASIC;
      case "basic-no-extrusions":
        return PRICE_PER_SQFT_BASIC_NO_EXTRUSIONS;
      case "tray":
        return PRICE_PER_SQFT_TRAY;
    }
  })();
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
