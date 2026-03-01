export type MetalSystemCategory = {
  id: string;
  title: string;
  description?: string;
  items: {
    id: string;
    name: string;
    image: string;
    short: string;
    tags?: string[];
    configKey: string;
    specUrl?: string;
  }[];
};

export const METAL_SYSTEM_CATEGORIES: MetalSystemCategory[] = [
  {
    id: "precision-hwp-highline-boxrib",
    title: "Precision Series HWP, Highline and Box Rib Systems",
    description: "Concealed fastener systems with multiple profile depths and rib options.",
    items: [
      { id: "hwp", name: "HWP", image: "/metal-systems/hwp.png", short: "Concealed fastener wall panel with flat face and consistent joint.", tags: ["Concealed", "Steel/Aluminum"], configKey: "precision-series", specUrl: "#specs" },
      { id: "highline-b1", name: "Highline B1", image: "/metal-systems/highline-b1.png", short: "Shallow rib profile for subtle shadow and clean lines.", tags: ["Concealed", "Min length 5'"], configKey: "precision-series", specUrl: "#specs" },
      { id: "highline-b2", name: "Highline B2", image: "/metal-systems/highline-b2.png", short: "Medium-depth rib for defined articulation.", tags: ["Concealed"], configKey: "precision-series", specUrl: "#specs" },
      { id: "highline-c1", name: "Highline C1", image: "/metal-systems/highline-c1.png", short: "Rib profile suited to rainscreen and CI assemblies.", tags: ["Concealed", "Steel/Aluminum"], configKey: "precision-series", specUrl: "#specs" },
      { id: "highline-c2", name: "Highline C2", image: "/metal-systems/highline-c2.png", short: "Deeper rib option for stronger shadow lines.", tags: ["Concealed"], configKey: "precision-series", specUrl: "#specs" },
      { id: "highline-m1", name: "Highline M1", image: "/metal-systems/highline-m1.png", short: "Mid-depth rib for balanced profile and performance.", tags: ["Concealed"], configKey: "precision-series", specUrl: "#specs" },
      { id: "highline-s1", name: "Highline S1", image: "/metal-systems/highline-s1.png", short: "Shallow rib for minimal shadow and planar look.", tags: ["Concealed"], configKey: "precision-series", specUrl: "#specs" },
      { id: "highline-s2", name: "Highline S2", image: "/metal-systems/highline-s2.png", short: "Slim rib profile for refined facades.", tags: ["Concealed"], configKey: "precision-series", specUrl: "#specs" },
      { id: "boxrib-1", name: "Box Rib 1", image: "/metal-systems/boxrib-1.png", short: "Box rib profile for pronounced rhythm and depth.", tags: ["Concealed"], configKey: "precision-series", specUrl: "#specs" },
      { id: "boxrib-2", name: "Box Rib 2", image: "/metal-systems/boxrib-2.png", short: "Alternate box rib spacing and reveal.", tags: ["Concealed"], configKey: "precision-series", specUrl: "#specs" },
      { id: "boxrib-3", name: "Box Rib 3", image: "/metal-systems/boxrib-3.png", short: "Box rib variant for design flexibility.", tags: ["Concealed"], configKey: "precision-series", specUrl: "#specs" },
      { id: "boxrib-4", name: "Box Rib 4", image: "/metal-systems/boxrib-4.png", short: "Wide box rib for bold articulation.", tags: ["Concealed"], configKey: "precision-series", specUrl: "#specs" },
    ],
  },
  {
    id: "flush-reveal",
    title: "Flush and Reveal Systems",
    description: "Flat and reveal-joint panels for planar facades and controlled shadow.",
    items: [
      { id: "flush-panel", name: "Flush Panel", image: "/metal-systems/flush-panel.png", short: "Flat face with concealed joints for a continuous plane.", tags: ["Concealed", "Steel/Aluminum"], configKey: "flush-reveal", specUrl: "#specs" },
      { id: "reveal-panel", name: "Reveal Panel", image: "/metal-systems/reveal-panel.png", short: "Reveal joint for defined shadow lines and panel expression.", tags: ["Concealed"], configKey: "flush-reveal", specUrl: "#specs" },
    ],
  },
  {
    id: "precision-tile",
    title: "Precision Series Tile Systems",
    description: "Tile-style metal panels with clipped, flat, or diamond profiles.",
    items: [
      { id: "tile-clipped", name: "Clipped", image: "/metal-systems/tile-clipped.png", short: "Clipped tile profile for modular wall expression.", tags: ["Concealed"], configKey: "precision-series", specUrl: "#specs" },
      { id: "tile-flat", name: "Flat", image: "/metal-systems/tile-flat.png", short: "Flat tile face for a clean, uniform surface.", tags: ["Concealed"], configKey: "precision-series", specUrl: "#specs" },
      { id: "tile-diamond", name: "Diamond", image: "/metal-systems/tile-diamond.png", short: "Diamond-profile tile for texture and shadow.", tags: ["Concealed"], configKey: "precision-series", specUrl: "#specs" },
    ],
  },
  {
    id: "exposed-fastener",
    title: "Exposed Fastener Systems",
    description: "Ribbed and corrugated panels with exposed fasteners as part of the design.",
    items: [
      { id: "panel-7-2", name: "7.2 Panel", image: "/metal-systems/7-2-panel.png", short: "7.2\" on-center rib with exposed fastener.", tags: ["Exposed", "Steel/Aluminum"], configKey: "exposed-fastener", specUrl: "#specs" },
      { id: "panel-r36", name: "R-36 Panel", image: "/metal-systems/r-36-panel.png", short: "R-36 profile for structural and aesthetic applications.", tags: ["Exposed"], configKey: "exposed-fastener", specUrl: "#specs" },
      { id: "panel-m42", name: "M-42 Panel", image: "/metal-systems/m-42-panel.png", short: "M-42 rib panel with exposed fastener.", tags: ["Exposed"], configKey: "exposed-fastener", specUrl: "#specs" },
      { id: "panel-m36", name: "M-36 Panel", image: "/metal-systems/m-36-panel.png", short: "M-36 profile for wall and soffit.", tags: ["Exposed"], configKey: "exposed-fastener", specUrl: "#specs" },
      { id: "corr-7-8", name: "7/8 Corrugated", image: "/metal-systems/7-8-corrugated.png", short: "7/8\" corrugated for classic rib expression.", tags: ["Exposed"], configKey: "exposed-fastener", specUrl: "#specs" },
      { id: "corr-1-2", name: "1/2 Corrugated", image: "/metal-systems/1-2-corrugated.png", short: "1/2\" corrugated for finer rib scale.", tags: ["Exposed"], configKey: "exposed-fastener", specUrl: "#specs" },
    ],
  },
  {
    id: "field-assembled-composite",
    title: "Field-Assembled Composite Wall Panel Systems",
    description: "Composite panels with reveal and deep-reveal options for field assembly.",
    items: [
      { id: "pac-4000-rv", name: "PAC-4000 Reveal (RV)", image: "/metal-systems/pac-4000-rv.png", short: "Field-assembled composite with reveal joint.", tags: ["Composite", "Reveal"], configKey: "specialty-custom", specUrl: "#specs" },
      { id: "pac-4000-drv", name: "PAC-4000 Deep Reveal (DRV)", image: "/metal-systems/pac-4000-drv.png", short: "Field-assembled composite with deep reveal.", tags: ["Composite", "Deep Reveal"], configKey: "specialty-custom", specUrl: "#specs" },
    ],
  },
  {
    id: "composite-wall",
    title: "Composite Wall Panel Systems",
    description: "Factory-assembled composite wall panel systems.",
    items: [
      { id: "pac-3000-cs", name: "PAC-3000 CS", image: "/metal-systems/pac-3000-cs.png", short: "Composite system with concealed joint.", tags: ["Composite", "Concealed"], configKey: "specialty-custom", specUrl: "#specs" },
      { id: "pac-3000-rs", name: "PAC-3000 RS", image: "/metal-systems/pac-3000-rs.png", short: "Composite system with reveal joint.", tags: ["Composite", "Reveal"], configKey: "specialty-custom", specUrl: "#specs" },
    ],
  },
  {
    id: "board-batten",
    title: "Board & Batten Wall Panel Systems",
    description: "Vertical board and batten expression in metal.",
    items: [
      { id: "board-batten", name: "Board & Batten", image: "/metal-systems/board-batten.png", short: "Traditional board and batten pattern in metal wall panel.", tags: ["Concealed", "Steel/Aluminum"], configKey: "board-batten", specUrl: "#specs" },
    ],
  },
  {
    id: "perforated",
    title: "Perforated Aluminum Panels & Flat Sheet",
    description: "Perforated and flat sheet options for screening and facades.",
    items: [
      { id: "perforated-7-2", name: "Perforated 7.2 Panel (Example)", image: "/metal-systems/perforated-7-2.png", short: "Perforated 7.2 panel for solar shading and aesthetics.", tags: ["Perforated", "Aluminum"], configKey: "specialty-custom", specUrl: "#specs" },
    ],
  },
];
