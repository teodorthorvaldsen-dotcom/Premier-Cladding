export type PacCladFinishType = "Solid" | "Metallic" | "Mica" | "Timber" | "Other";

export interface PacCladColor {
  id: string;
  name: string;
  /** Reference code exactly as shown in the PAC-CLAD Color Guide (include any parentheses / legacy notes). */
  code: string;
  /** Informal color family grouping (e.g. "Gray", "Blue", "Brown"). */
  family: string;
  /** High-level finish type bucket used for filtering. */
  finishType: PacCladFinishType;
  /** Hex approximation of the swatch color for UI use. */
  swatchHex?: string;
  /**
   * Optional path to a texture or photographic swatch.
   * TODO: Replace placeholder hex-only colors with official PAC-CLAD swatch images.
   */
  swatchImage?: string;
}

export type PacCladColorId = PacCladColor["id"];

export const pacCladFinishTypes: PacCladFinishType[] = [
  "Solid",
  "Metallic",
  "Mica",
  "Timber",
  "Other",
];

/**
 * NOTE:
 * - This is a representative starter set of PAC-CLAD colors.
 * - Names and codes should be verified and extended against the official PAC-CLAD Color Guide.
 * - Hex values are approximations for on-screen use only.
 * - Update this list with the full palette as needed.
 */
export const pacCladColors: PacCladColor[] = [
  // --- SOLIDS ---
  {
    id: "bone-white",
    name: "Bone White",
    code: "PAC-CLAD Bone White",
    family: "White",
    finishType: "Solid",
    swatchHex: "#F5F5F3", // TODO: approximate
  },
  {
    id: "cityscape",
    name: "Cityscape",
    code: "PAC-CLAD Cityscape",
    family: "Gray",
    finishType: "Solid",
    swatchHex: "#A2A5AA", // TODO: approximate
  },
  {
    id: "charcoal",
    name: "Charcoal",
    code: "PAC-CLAD Charcoal",
    family: "Gray",
    finishType: "Solid",
    swatchHex: "#4B4E53", // TODO: approximate
  },
  {
    id: "slate-gray",
    name: "Slate Gray",
    code: "PAC-CLAD Slate Gray",
    family: "Gray",
    finishType: "Solid",
    swatchHex: "#6C7074", // TODO: approximate
  },
  {
    id: "burnt-umber",
    name: "Burnt Umber",
    code: "PAC-CLAD Burnt Umber",
    family: "Brown",
    finishType: "Solid",
    swatchHex: "#6B4A35", // TODO: approximate
  },
  {
    id: "evergreen",
    name: "Evergreen",
    code: "PAC-CLAD Evergreen",
    family: "Green",
    finishType: "Solid",
    swatchHex: "#1F4E3A", // TODO: approximate
  },
  {
    id: "cardinal-red",
    name: "Cardinal Red",
    code: "PAC-CLAD Cardinal Red",
    family: "Red",
    finishType: "Solid",
    swatchHex: "#9D2235", // TODO: approximate
  },

  // --- METALLIC ---
  {
    id: "silver-metallic",
    name: "Silver Metallic",
    code: "PAC-CLAD Silver Metallic",
    family: "Metallic",
    finishType: "Metallic",
    swatchHex: "#C0C2C5", // TODO: approximate
  },
  {
    id: "champagne-metallic",
    name: "Champagne Metallic",
    code: "PAC-CLAD Champagne Metallic",
    family: "Metallic",
    finishType: "Metallic",
    swatchHex: "#C9B79A", // TODO: approximate
  },
  {
    id: "copper-penny-metallic",
    name: "Copper Penny Metallic",
    code: "PAC-CLAD Copper Penny Metallic",
    family: "Metallic",
    finishType: "Metallic",
    swatchHex: "#B16A3F", // TODO: approximate
  },

  // --- MICA ---
  {
    id: "anodic-clear-mica",
    name: "Anodic Clear Mica",
    code: "PAC-CLAD Anodic Clear Mica",
    family: "Mica",
    finishType: "Mica",
    swatchHex: "#D2D3D4", // TODO: approximate
  },
  {
    id: "anodic-silver-mica",
    name: "Anodic Silver Mica",
    code: "PAC-CLAD Anodic Silver Mica",
    family: "Mica",
    finishType: "Mica",
    swatchHex: "#B7B9BC", // TODO: approximate
  },

  // --- TIMBER / WOOD GRAIN ---
  {
    id: "timberline-ash",
    name: "Timberline Ash",
    code: "PAC-CLAD Timberline Ash",
    family: "Wood",
    finishType: "Timber",
    swatchHex: "#A18A6A", // TODO: approximate
    swatchImage: "/images/pac-clad/timberline-ash.jpg", // TODO: placeholder path
  },
  {
    id: "timberline-walnut",
    name: "Timberline Walnut",
    code: "PAC-CLAD Timberline Walnut",
    family: "Wood",
    finishType: "Timber",
    swatchHex: "#5A4131", // TODO: approximate
    swatchImage: "/images/pac-clad/timberline-walnut.jpg", // TODO: placeholder path
  },

  // --- OTHER / SPECIALTY ---
  {
    id: "zinc",
    name: "Zinc",
    code: "PAC-CLAD Natural Zinc (where available)",
    family: "Specialty",
    finishType: "Other",
    swatchHex: "#9EA3A6", // TODO: approximate
  },
  {
    id: "weathered-zinc",
    name: "Weathered Zinc",
    code: "PAC-CLAD Weathered Zinc",
    family: "Specialty",
    finishType: "Other",
    swatchHex: "#7C7E7A", // TODO: approximate
  },
];

