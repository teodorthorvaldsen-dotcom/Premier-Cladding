/** Draft quote request stored when user clicks "Request Final Quote". */
export interface QuoteDraft {
  /** Common fields used by the ACM configurator (kept for backwards compatibility). */
  widthIn: number;
  lengthIn: number;
  leftReturnIn?: number;
  rightReturnIn?: number;
  widthId: string | null;
  thicknessId: string;
  colorId: string;
  finishId: string;
  quantity: number;
  areaFt2PerPanel: number;
  totalSqFt: number;
  estimatedTotal: number;
  panelType?: string;
  panelTypeLabel?: string;
  /** Display labels for summary (width label, thickness label, color name, color code, finish label). */
  widthLabel: string;
  thicknessLabel: string;
  colorName: string;
  colorCode: string;
  finishLabel: string;
  colorAvailability?: string;
  colorLeadTimeDaysRange?: [number, number];
  widthAvailability?: string;
  widthLeadTimeDaysRange?: [number, number];

  /**
   * Product kind and navigation helpers.
   * "acm" = ACM panel configurator, "metal" = metal wall panel configurator.
   */
  productKind?: "acm" | "metal";
  /** Optional label for the product family (e.g. "ACM Panels", "Metal Wall Panel System"). */
  productLabel?: string;
  /** Optional URL to send the user back to the originating configurator. */
  returnUrl?: string;

  /** Custom color: paint code, Pantone, or other reference (ACM custom match). */
  customColorReference?: string;
  /** PDF embedded from configurator when under size limit (1 MB) for quote submission. */
  customColorSpecAttachment?: {
    fileName: string;
    dataBase64: string;
    mimeType: string;
  };
  /** If user attached a PDF larger than the embed limit, filename only — user should re-attach on the quote form. */
  customColorSpecOversizeFileName?: string;

  /**
   * Optional fields specific to metal wall panel system quotes.
   * These are populated by the Metal Wall Panel Configurator.
   */
  metalSystemId?: string;
  metalSystemLabel?: string;
  metalMaterial?: string;
  metalGauge?: string;
  metalFinishCategory?: string;
  metalColorId?: string;
  metalColorName?: string;
  metalColorCode?: string;
  metalTotalSqFt?: number;
  metalPricePerSqFt?: number;
  metalMaterialSubtotal?: number;
  metalLaborSubtotal?: number;
  metalLocationState?: string;
  metalLocationPostalCode?: string;
}

export const QUOTE_DRAFT_STORAGE_KEY = "acm-quote-draft";
