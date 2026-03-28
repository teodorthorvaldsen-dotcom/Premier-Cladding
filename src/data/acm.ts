export const basePricePerFt2 = 8.5;

/** Minimum order value (USD). */
export const MIN_ORDER_VALUE = 400;

export type Availability = "In Stock" | "Made to Order";

export function formatLeadTimeDays(range: [number, number]): string {
  return `${range[0]}–${range[1]} business days`;
}

/** Alfrex FR standard widths (in). */
export const standardWidths = [
  { id: "50", label: '50"', widthIn: 50, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "62", label: '62"', widthIn: 62, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
] as const;

export const allWidths = standardWidths;

/** Custom width range (in). */
export const CUSTOM_WIDTH_MIN_IN = 12;
export const CUSTOM_WIDTH_MAX_IN = 62;

/** Max length (in) by thickness for Alfrex FR. 4 mm: 15 ft 10 in. */
export const maxLengthByThicknessMm: Record<number, number> = {
  4: 190, // 15 ft 10 in
};

export const MIN_LENGTH_IN = 12;

/** Alfrex FR: 4 mm only. */
export const thicknesses = [
  { id: "4mm", label: "4 mm", multiplier: 1.12 },
] as const;

/** Single standard finish (70% Kynar PVDF); multiplier 1.0 for pricing. */
export const finishes = [
  { id: "standard", label: "Standard", multiplier: 1.0 },
] as const;

export type ColorSeries =
  | "Solids"
  | "Micas"
  | "Metallics"
  | "Wood"
  | "Metal"
  | "Specialty";

/** Display category for swatch grouping. */
export type ColorCategory = "Solid" | "Mica" | "Metallic" | "Wood" | "Metal" | "Specialty";

/** Map series to display category. */
export const seriesToCategory: Record<ColorSeries, ColorCategory> = {
  Solids: "Solid",
  Micas: "Mica",
  Metallics: "Metallic",
  Wood: "Wood",
  Metal: "Metal",
  Specialty: "Specialty",
};

export const colorCategoryList: ColorCategory[] = [
  "Solid",
  "Mica",
  "Metallic",
  "Wood",
  "Metal",
  "Specialty",
];

/** Premium adder per ft² by series (USD). Used in pricing logic. */
export const seriesAdderPerFt2: Record<ColorSeries, number> = {
  Solids: 0,
  Micas: 0,
  Metallics: 1,
  Wood: 1.5,
  Metal: 0,
  Specialty: 1.75,
};

export const colorSeriesList: ColorSeries[] = [
  "Solids",
  "Micas",
  "Metallics",
  "Wood",
  "Metal",
  "Specialty",
];

/**
 * Alfrex "2 Coat Solids" standard stocking order (grid layout per F-01).
 * RGB approximations from manufacturer stocking table for hex swatches in the configurator.
 */
export const twoCoatSolidColorIds = [
  "classic-white",
  "bone-white",
  "ascot-white",
  "alabaster",
  "oyster",
  "castle-gray",
  "sea-wolf",
  "dove-gray",
  "slate-gray",
  "fashion-gray",
  "greyhound",
  "dark-gray",
  "charcoal",
  "bronze",
  "black",
  "midnight-black",
] as const;

export type TwoCoatSolidColorId = (typeof twoCoatSolidColorIds)[number];

/** Vivid Solids — catalog row order (JY-7110 … JY-7150). */
export const vividSolidColorIds = [
  "signal-blue",
  "harmony-blue",
  "vibrant-red",
  "patriot-red",
  "ron-red",
] as const;

/** 2 Coat Micas — catalog grid order per Alfrex F-01. */
export const twoCoatMicaColorIds = [
  "anodic-clear-mica",
  "exotic-silver-mica",
  "silversmith",
  "gray-silver-mica",
  "pewter-mica",
  "mzg-gray-mica",
  "champagne-mica",
  "medium-bronze-mica",
  "driftwood-mica",
  "copper-penny-mica",
  "hazelnut-mica",
  "new-age-dark-bronze-mica",
] as const;

/** Alfrex standard finishes: id, name, code, category, series, swatchHex, swatchImage (for textures). */
export const colors = [
  { id: "classic-white", name: "Classic White", code: "JY-5195", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#EDEEEF", rgbApprox: "237 238 239", adderPerFt2: 0, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "bone-white", name: "Bone White", code: "JY-5165", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#E0E1E1", rgbApprox: "224 225 225", adderPerFt2: 0, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "ascot-white", name: "Ascot White", code: "JY-5110", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#CDD4CA", rgbApprox: "205 212 202", adderPerFt2: 0, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "alabaster", name: "Alabaster", code: "JY-6165", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#DADDD4", rgbApprox: "218 221 212", adderPerFt2: 0, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "oyster", name: "Oyster", code: "JY-5125", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#E2DCC9", rgbApprox: "226 220 201", adderPerFt2: 0, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "castle-gray", name: "Castle Gray", code: "JY-6160", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#B3AFA6", rgbApprox: "179 175 166", adderPerFt2: 0, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "sea-wolf", name: "Sea Wolf", code: "JY-6175", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#B1A9A0", rgbApprox: "177 169 160", adderPerFt2: 0, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "dove-gray", name: "Dove Gray", code: "JY-6120", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#A9AAA9", rgbApprox: "169 170 169", adderPerFt2: 0, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "slate-gray", name: "Slate Gray", code: "JY-6145", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#898782", rgbApprox: "137 135 130", adderPerFt2: 0, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "fashion-gray", name: "Fashion Gray", code: "JY-6130", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#838586", rgbApprox: "131 133 134", adderPerFt2: 0, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "greyhound", name: "Greyhound", code: "JY-6155", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#525558", rgbApprox: "82 85 88", adderPerFt2: 0, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "dark-gray", name: "Dark Gray", code: "JY-6140", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#666B6E", rgbApprox: "102 107 110", adderPerFt2: 0, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "charcoal", name: "Charcoal", code: "JY-6150", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#545556", rgbApprox: "84 85 86", adderPerFt2: 0, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "bronze", name: "Bronze", code: "JY-6180", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#57524D", rgbApprox: "87 82 77", adderPerFt2: 0, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "black", name: "Black", code: "JY-6220", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#4B4C4E", rgbApprox: "75 76 78", adderPerFt2: 0, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "midnight-black", name: "Midnight Black", code: "JY-6230", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#444544", rgbApprox: "68 69 68", adderPerFt2: 0, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "signal-blue", name: "Signal Blue", code: "JY-7110", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#44608E", rgbApprox: "68 96 142", adderPerFt2: 0.2, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "harmony-blue", name: "Harmony Blue", code: "JY-7115", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#4B5B95", rgbApprox: "75 91 149", adderPerFt2: 0.2, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "vibrant-red", name: "Vibrant Red", code: "JY-7120", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#8A2429", rgbApprox: "138 36 41", adderPerFt2: 0.25, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "patriot-red", name: "Patriot Red", code: "JY-7140", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#A41F19", rgbApprox: "164 31 25", adderPerFt2: 0.25, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "ron-red", name: "RON Red", code: "JY-7150", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#AB0400", rgbApprox: "171 4 0", adderPerFt2: 0.25, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "anodic-clear-mica", name: "Anodic Clear Mica", code: "JY-2510", category: "Mica" as ColorCategory, series: "Micas" as ColorSeries, swatchHex: "#D1D2D4", rgbApprox: "209 210 212", adderPerFt2: 0, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "exotic-silver-mica", name: "Exotic Silver Mica", code: "JY-2520", category: "Mica" as ColorCategory, series: "Micas" as ColorSeries, swatchHex: "#D3CDD8", rgbApprox: "211 205 216", adderPerFt2: 0, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "silversmith", name: "Silversmith", code: "JY-2515", category: "Mica" as ColorCategory, series: "Micas" as ColorSeries, swatchHex: "#CBCDCC", rgbApprox: "203 205 204", adderPerFt2: 0, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "gray-silver-mica", name: "Gray Silver Mica", code: "JY-2530", category: "Mica" as ColorCategory, series: "Micas" as ColorSeries, swatchHex: "#8B8D8B", rgbApprox: "139 141 139", adderPerFt2: 0, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "pewter-mica", name: "Pewter Mica", code: "JY-2540", category: "Mica" as ColorCategory, series: "Micas" as ColorSeries, swatchHex: "#7A7E82", rgbApprox: "122 126 130", adderPerFt2: 0, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "mzg-gray-mica", name: "MZG Gray Mica", code: "JY-2535", category: "Mica" as ColorCategory, series: "Micas" as ColorSeries, swatchHex: "#808282", rgbApprox: "128 130 130", adderPerFt2: 0, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "champagne-mica", name: "Champagne Mica", code: "JY-2550", category: "Mica" as ColorCategory, series: "Micas" as ColorSeries, swatchHex: "#C9C5BF", rgbApprox: "201 197 191", adderPerFt2: 0, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "medium-bronze-mica", name: "Medium Bronze Mica", code: "JY-2560", category: "Mica" as ColorCategory, series: "Micas" as ColorSeries, swatchHex: "#B1A392", rgbApprox: "177 163 146", adderPerFt2: 0, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "driftwood-mica", name: "Driftwood Mica", code: "JY-2555", category: "Mica" as ColorCategory, series: "Micas" as ColorSeries, swatchHex: "#8A867F", rgbApprox: "138 134 127", adderPerFt2: 0, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "copper-penny-mica", name: "Copper Penny Mica", code: "JY-2570", category: "Mica" as ColorCategory, series: "Micas" as ColorSeries, swatchHex: "#C0926C", rgbApprox: "192 146 108", adderPerFt2: 0, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "hazelnut-mica", name: "Hazelnut Mica", code: "JY-2575", category: "Mica" as ColorCategory, series: "Micas" as ColorSeries, swatchHex: "#8E755C", rgbApprox: "142 117 92", adderPerFt2: 0, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "new-age-dark-bronze-mica", name: "New Age Dark Bronze Mica", code: "JY-2580", category: "Mica" as ColorCategory, series: "Micas" as ColorSeries, swatchHex: "#62615B", rgbApprox: "98 97 91", adderPerFt2: 0, availability: "In Stock" as Availability, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "champagne-metallic", name: "Champagne Metallic", code: "JY-5401", category: "Metallic" as ColorCategory, series: "Metallics" as ColorSeries, swatchHex: "#C8B9A5", rgbApprox: "200 185 165", adderPerFt2: 0.5, availability: "Made to Order" as Availability, leadTimeDaysRange: [7, 14] as [number, number] },
  { id: "graphite-metallic", name: "Graphite Metallic", code: "JY-5403", category: "Metallic" as ColorCategory, series: "Metallics" as ColorSeries, swatchHex: "#5F5F5F", rgbApprox: "95 95 95", adderPerFt2: 0.45, availability: "Made to Order" as Availability, leadTimeDaysRange: [7, 14] as [number, number] },
  { id: "natural-zinc", name: "Natural Zinc", code: "JY-5501", category: "Metal" as ColorCategory, series: "Metal" as ColorSeries, swatchHex: "#A5A5A0", rgbApprox: "165 165 160", adderPerFt2: 0.5, availability: "Made to Order" as Availability, leadTimeDaysRange: [7, 14] as [number, number] },
  { id: "brushed-aluminum", name: "Brushed Aluminum", code: "JY-5502", category: "Metal" as ColorCategory, series: "Metal" as ColorSeries, swatchHex: "#B4B4B2", rgbApprox: "180 180 178", adderPerFt2: 0.45, availability: "Made to Order" as Availability, leadTimeDaysRange: [7, 14] as [number, number] },
  { id: "walnut", name: "Walnut", code: "JY-5601", category: "Wood" as ColorCategory, series: "Wood" as ColorSeries, swatchHex: "#5F4637", swatchImage: "/images/swatches/walnut.png", rgbApprox: "95 70 55", adderPerFt2: 0.5, availability: "Made to Order" as Availability, leadTimeDaysRange: [7, 14] as [number, number] },
  { id: "teak", name: "Teak", code: "JY-5602", category: "Wood" as ColorCategory, series: "Wood" as ColorSeries, swatchHex: "#785A41", swatchImage: "/images/swatches/teak.png", rgbApprox: "120 90 65", adderPerFt2: 0.5, availability: "Made to Order" as Availability, leadTimeDaysRange: [7, 14] as [number, number] },
  { id: "prismatic-silver", name: "Prismatic Silver", code: "JY-5701", category: "Specialty" as ColorCategory, series: "Specialty" as ColorSeries, swatchHex: "#C8C8C8", rgbApprox: "200 200 200", adderPerFt2: 0.55, availability: "Made to Order" as Availability, leadTimeDaysRange: [7, 14] as [number, number] },
  { id: "prismatic-gold", name: "Prismatic Gold", code: "JY-5702", category: "Specialty" as ColorCategory, series: "Specialty" as ColorSeries, swatchHex: "#BEAA82", rgbApprox: "190 170 130", adderPerFt2: 0.55, availability: "Made to Order" as Availability, leadTimeDaysRange: [7, 14] as [number, number] },
] as const;

export type WidthId = (typeof allWidths)[number]["id"];
export type ThicknessId = (typeof thicknesses)[number]["id"];
export type FinishId = (typeof finishes)[number]["id"];
export type ColorId = (typeof colors)[number]["id"];

