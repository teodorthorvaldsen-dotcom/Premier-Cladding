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
  4: 190,
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

export type ColorCategory = "Solid" | "Mica" | "Metallic" | "Wood" | "Metal" | "Specialty";

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

/** Catalog grid order — Alfrex FR MCM standard finishes (F-01 style). */
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

export const vividSolidColorIds = [
  "signal-blue",
  "harmony-blue",
  "vibrant-red",
  "patriot-red",
  "ron-red",
] as const;

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

/** First row L→R, then Graphite Metallic (JY-3530). */
export const threeCoatMetallicColorIds = [
  "bright-silver-metallic",
  "champagne-metallic",
  "pex-pewter-metallic",
  "jlr-gray-metallic",
  "anthracite-silver-metallic",
  "graphite-metallic",
] as const;

export const metalSeriesColorIds = [
  "faux-zinc-lite",
  "faux-zinc",
  "faux-zinc-graphite",
  "tile-corten",
] as const;

export const woodSeriesColorIds = ["teak", "golden-oak", "dark-walnut"] as const;

export const naturalZincColorIds = ["blue-grey", "graphite-grey"] as const;

export const specialtyFinishColorIds = ["hairline-clear", "mirror"] as const;

const stock: Availability = "In Stock";
const mto: Availability = "Made to Order";

/** Alfrex standard finishes. */
export const colors = [
  { id: "classic-white", name: "Classic White", code: "JY-5195", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#EDEEEF", rgbApprox: "237 238 239", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "bone-white", name: "Bone White", code: "JY-5165", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#E0E1E1", rgbApprox: "224 225 225", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "ascot-white", name: "Ascot White", code: "JY-5110", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#CDD4CA", rgbApprox: "205 212 202", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "alabaster", name: "Alabaster", code: "JY-6165", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#DADDD4", rgbApprox: "218 221 212", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "oyster", name: "Oyster", code: "JY-5125", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#E2DCC9", rgbApprox: "226 220 201", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "castle-gray", name: "Castle Gray", code: "JY-6160", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#B3AFA6", rgbApprox: "179 175 166", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "sea-wolf", name: "Sea Wolf", code: "JY-6175", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#B1A9A0", rgbApprox: "177 169 160", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "dove-gray", name: "Dove Gray", code: "JY-6120", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#A9AAA9", rgbApprox: "169 170 169", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "slate-gray", name: "Slate Gray", code: "JY-6145", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#898782", rgbApprox: "137 135 130", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "fashion-gray", name: "Fashion Gray", code: "JY-6130", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#838586", rgbApprox: "131 133 134", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "greyhound", name: "Greyhound", code: "JY-6155", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#525558", rgbApprox: "82 85 88", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "dark-gray", name: "Dark Gray", code: "JY-6140", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#666B6E", rgbApprox: "102 107 110", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "charcoal", name: "Charcoal", code: "JY-6150", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#545556", rgbApprox: "84 85 86", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "bronze", name: "Bronze", code: "JY-6180", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#57524D", rgbApprox: "87 82 77", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "black", name: "Black", code: "JY-6220", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#4B4C4E", rgbApprox: "75 76 78", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "midnight-black", name: "Midnight Black", code: "JY-6230", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#444544", rgbApprox: "68 69 68", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "signal-blue", name: "Signal Blue", code: "JY-7110", coatSystemLabel: "2 coat solid", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#44608E", rgbApprox: "68 96 142", adderPerFt2: 0.2, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "harmony-blue", name: "Harmony Blue", code: "JY-7115", coatSystemLabel: "2 coat solid", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#4B5B95", rgbApprox: "75 91 149", adderPerFt2: 0.2, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "vibrant-red", name: "Vibrant Red", code: "JY-7120", coatSystemLabel: "3 coat solid", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#8A2429", rgbApprox: "138 36 41", adderPerFt2: 0.25, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "patriot-red", name: "Patriot Red", code: "JY-7140", coatSystemLabel: "3 coat solid", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#A41F19", rgbApprox: "164 31 25", adderPerFt2: 0.25, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "ron-red", name: "RON Red", code: "JY-7150", coatSystemLabel: "3 coat solid", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#AB0400", rgbApprox: "171 4 0", adderPerFt2: 0.25, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "anodic-clear-mica", name: "Anodic Clear Mica", code: "JY-2510", category: "Mica" as ColorCategory, series: "Micas" as ColorSeries, swatchHex: "#D1D2D4", rgbApprox: "209 210 212", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "exotic-silver-mica", name: "Exotic Silver Mica", code: "JY-2520", category: "Mica" as ColorCategory, series: "Micas" as ColorSeries, swatchHex: "#D3CDD8", rgbApprox: "211 205 216", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "silversmith", name: "Silversmith", code: "JY-2515", category: "Mica" as ColorCategory, series: "Micas" as ColorSeries, swatchHex: "#CBCDCC", rgbApprox: "203 205 204", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "gray-silver-mica", name: "Gray Silver Mica", code: "JY-2530", category: "Mica" as ColorCategory, series: "Micas" as ColorSeries, swatchHex: "#8B8D8B", rgbApprox: "139 141 139", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "pewter-mica", name: "Pewter Mica", code: "JY-2540", category: "Mica" as ColorCategory, series: "Micas" as ColorSeries, swatchHex: "#7A7E82", rgbApprox: "122 126 130", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "mzg-gray-mica", name: "MZG Gray Mica", code: "JY-2535", category: "Mica" as ColorCategory, series: "Micas" as ColorSeries, swatchHex: "#808282", rgbApprox: "128 130 130", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "champagne-mica", name: "Champagne Mica", code: "JY-2550", category: "Mica" as ColorCategory, series: "Micas" as ColorSeries, swatchHex: "#C9C5BF", rgbApprox: "201 197 191", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "medium-bronze-mica", name: "Medium Bronze Mica", code: "JY-2560", category: "Mica" as ColorCategory, series: "Micas" as ColorSeries, swatchHex: "#B1A392", rgbApprox: "177 163 146", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "driftwood-mica", name: "Driftwood Mica", code: "JY-2555", category: "Mica" as ColorCategory, series: "Micas" as ColorSeries, swatchHex: "#8A867F", rgbApprox: "138 134 127", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "copper-penny-mica", name: "Copper Penny Mica", code: "JY-2570", category: "Mica" as ColorCategory, series: "Micas" as ColorSeries, swatchHex: "#C0926C", rgbApprox: "192 146 108", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "hazelnut-mica", name: "Hazelnut Mica", code: "JY-2575", category: "Mica" as ColorCategory, series: "Micas" as ColorSeries, swatchHex: "#8E755C", rgbApprox: "142 117 92", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "new-age-dark-bronze-mica", name: "New Age Dark Bronze Mica", code: "JY-2580", category: "Mica" as ColorCategory, series: "Micas" as ColorSeries, swatchHex: "#62615B", rgbApprox: "98 97 91", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "bright-silver-metallic", name: "Bright Silver Metallic", code: "JY-3510", category: "Metallic" as ColorCategory, series: "Metallics" as ColorSeries, swatchHex: "#D7D7D8", rgbApprox: "215 215 216", adderPerFt2: 1, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "champagne-metallic", name: "Champagne Metallic", code: "JY-3520", category: "Metallic" as ColorCategory, series: "Metallics" as ColorSeries, swatchHex: "#BFC0C0", rgbApprox: "191 192 192", adderPerFt2: 1, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "pex-pewter-metallic", name: "PEX Pewter Metallic", code: "JY-3540", category: "Metallic" as ColorCategory, series: "Metallics" as ColorSeries, swatchHex: "#ADACAA", rgbApprox: "173 172 170", adderPerFt2: 1, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "jlr-gray-metallic", name: "JLR Gray Metallic", code: "JY-3550", category: "Metallic" as ColorCategory, series: "Metallics" as ColorSeries, swatchHex: "#878583", rgbApprox: "135 133 131", adderPerFt2: 1, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "anthracite-silver-metallic", name: "Anthracite Silver Metallic", code: "JY-3560", category: "Metallic" as ColorCategory, series: "Metallics" as ColorSeries, swatchHex: "#53585B", rgbApprox: "83 88 91", adderPerFt2: 1, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "graphite-metallic", name: "Graphite Metallic", code: "JY-3530", category: "Metallic" as ColorCategory, series: "Metallics" as ColorSeries, swatchHex: "#565758", rgbApprox: "86 87 88", adderPerFt2: 1, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "faux-zinc-lite", name: "Faux Zinc Lite", code: "JY-M130", category: "Metal" as ColorCategory, series: "Metal" as ColorSeries, swatchHex: "#B8BCBE", rgbApprox: "approx. print", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "faux-zinc", name: "Faux Zinc", code: "JY-M120", category: "Metal" as ColorCategory, series: "Metal" as ColorSeries, swatchHex: "#8A8D8F", rgbApprox: "approx. print", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "faux-zinc-graphite", name: "Faux Zinc Graphite", code: "JY-M110", category: "Metal" as ColorCategory, series: "Metal" as ColorSeries, swatchHex: "#4F5254", rgbApprox: "approx. print", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "tile-corten", name: "Tile Corten", code: "JY-M140", category: "Metal" as ColorCategory, series: "Metal" as ColorSeries, swatchHex: "#965A3C", rgbApprox: "approx. print", adderPerFt2: 0, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "teak", name: "Teak", code: "JY-W120", category: "Wood" as ColorCategory, series: "Wood" as ColorSeries, swatchHex: "#6B4E3D", rgbApprox: "approx. wood", adderPerFt2: 1.5, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "golden-oak", name: "Golden Oak", code: "JY-W140", category: "Wood" as ColorCategory, series: "Wood" as ColorSeries, swatchHex: "#8D734A", rgbApprox: "approx. wood", adderPerFt2: 1.5, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "dark-walnut", name: "Dark Walnut", code: "JY-W150", category: "Wood" as ColorCategory, series: "Wood" as ColorSeries, swatchHex: "#4A3728", rgbApprox: "approx. wood", adderPerFt2: 1.5, availability: stock, leadTimeDaysRange: [2, 5] as [number, number] },
  { id: "blue-grey", name: "Blue Grey", code: "JY-Z110", category: "Specialty" as ColorCategory, series: "Specialty" as ColorSeries, swatchHex: "#5C6B74", rgbApprox: "Natural Zinc", adderPerFt2: 1.75, availability: mto, leadTimeDaysRange: [10, 21] as [number, number] },
  { id: "graphite-grey", name: "Graphite Grey", code: "JY-Z100", category: "Specialty" as ColorCategory, series: "Specialty" as ColorSeries, swatchHex: "#4B5054", rgbApprox: "Natural Zinc", adderPerFt2: 1.75, availability: mto, leadTimeDaysRange: [10, 21] as [number, number] },
  { id: "hairline-clear", name: "Hairline Clear", code: "JY-H100", category: "Specialty" as ColorCategory, series: "Specialty" as ColorSeries, swatchHex: "#B8B8B8", rgbApprox: "Specialty", adderPerFt2: 1.75, availability: mto, leadTimeDaysRange: [10, 21] as [number, number] },
  { id: "mirror", name: "Mirror", code: "JY-A160", category: "Specialty" as ColorCategory, series: "Specialty" as ColorSeries, swatchHex: "#D0D0D0", rgbApprox: "Specialty", adderPerFt2: 1.75, availability: mto, leadTimeDaysRange: [10, 21] as [number, number] },
  { id: "custom-color-match", name: "Custom color match", code: "Custom (MOQ)", category: "Solid" as ColorCategory, series: "Solids" as ColorSeries, swatchHex: "#9CA3AF", rgbApprox: "Per sample / Pantone", adderPerFt2: 0, availability: mto, leadTimeDaysRange: [14, 28] as [number, number] },
] as const;

export type WidthId = (typeof allWidths)[number]["id"];
export type ThicknessId = (typeof thicknesses)[number]["id"];
export type FinishId = (typeof finishes)[number]["id"];
export type ColorId = (typeof colors)[number]["id"];

/** All series-driven IDs plus custom match (for picker grouping). */
export const allCatalogColorIds = new Set<string>([
  ...twoCoatSolidColorIds,
  ...vividSolidColorIds,
  ...twoCoatMicaColorIds,
  ...threeCoatMetallicColorIds,
  ...metalSeriesColorIds,
  ...woodSeriesColorIds,
  ...naturalZincColorIds,
  ...specialtyFinishColorIds,
  "custom-color-match",
]);
