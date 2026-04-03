import type { CartItem } from "@/types/cart";

export type Role = "customer" | "employee";

export type UserRecord = {
  id: string;
  email: string;
  password: string;
  role: Role;
  customerId?: string;
  name: string;
};

export type ShippingAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
};

/** Flat-pattern / fabrication dimensions (mirrors configurator → DXF-style output). */
export type CadSegment = {
  label: string;
  lengthIn: number;
  angleDeg?: number;
};

export type CadMeasurements = {
  nominal: {
    widthIn: number;
    heightIn: number;
    depthIn?: number;
    unit: string;
  };
  flatPattern: {
    boundingWidthIn: number;
    boundingLengthIn: number;
    segments: CadSegment[];
    notes?: string[];
  };
  thicknessMm: number;
  dxfUnits: "inches";
};

export type OrderRecord = {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  status: "Pending" | "In Production" | "Completed" | "Shipped";
  createdAt: string;
  projectName: string;
  measurements: {
    width: number;
    height: number;
    depth?: number;
    unit: string;
  };
  material: string;
  color: string;
  /** Fallback thumbnail when `lineItem.previewImageDataUrl` is absent. */
  previewImageSrc: string;
  cadMeasurements: CadMeasurements;
  /** Cart-shaped configuration for checkout-parity UI (preview modal, DXF/CSV export). */
  lineItem: CartItem;
};

export const demoUsers: UserRecord[] = [
  {
    id: "u1",
    email: "customer@example.com",
    password: "customer123",
    role: "customer",
    customerId: "c1",
    name: "Lauren Customer",
  },
  {
    id: "u2",
    email: "employee@example.com",
    password: "employee123",
    role: "employee",
    name: "Alex Employee",
  },
];

const ord1001TraySpec = `Row 1: Side 1 | Edge: Front | Return height: 30" | Angle: 90° | root return off flat center (Side slot order)
Row 2: Side 2 | Edge: Right | Return height: 18" | Angle: 90° | continues from Side 1
Row 3: Side 3 | Edge: Back | Return height: 14" | Angle: 90° | stacked return
Row 4: Side 4 | Edge: Left | Return height: 12" | Angle: 90° | closes perimeter
Row 5: Side 1 (nested) | Edge: Front | Return height: 6" | Angle: 45° | dog-ear stiffener`;

export const demoOrders: OrderRecord[] = [
  {
    id: "ORD-1001",
    customerId: "c1",
    customerName: "Lauren Customer",
    customerEmail: "lauren.customer@example.com",
    customerPhone: "(555) 014-2201",
    shippingAddress: {
      line1: "1420 Industrial Blvd",
      line2: "Suite 300",
      city: "Dallas",
      state: "TX",
      postalCode: "75207",
    },
    status: "In Production",
    createdAt: "2026-04-02",
    projectName: "Entry Facade Panels",
    measurements: {
      width: 62,
      height: 96,
      depth: 30,
      unit: "in",
    },
    material: "ACM",
    color: "RON Red",
    previewImageSrc: "/portal-orders/ord-1001-preview.svg",
    lineItem: {
      id: "ORD-1001",
      standardId: "62",
      widthIn: 62,
      heightIn: 96,
      colorId: "ron-red",
      finishId: "standard",
      thicknessId: "4mm",
      quantity: 10,
      unitPrice: 992,
      areaFt2: (62 * 96) / 144,
      panelType: "basic",
      panelTypeLabel: "Basic Rectangular",
      boxTraySides: [
        { id: "t1", edge: "south", flangeHeightIn: 30, angleDeg: 90 },
        { id: "t2", edge: "north", flangeHeightIn: 24, angleDeg: 90 },
        { id: "t3", edge: "west", flangeHeightIn: 12, angleDeg: 90 },
        { id: "t4", edge: "east", flangeHeightIn: 12, angleDeg: 90 },
      ],
      trayBuildSpec: ord1001TraySpec,
    },
    cadMeasurements: {
      nominal: { widthIn: 62, heightIn: 96, depthIn: 30, unit: "in" },
      thicknessMm: 4,
      dxfUnits: "inches",
      flatPattern: {
        boundingWidthIn: 86,
        boundingLengthIn: 150,
        segments: [
          { label: "Face — width", lengthIn: 62 },
          { label: "Face — height", lengthIn: 96 },
          { label: "South return (Row 1)", lengthIn: 30, angleDeg: 90 },
          { label: "North return (Row 3)", lengthIn: 24, angleDeg: 90 },
          { label: "West return", lengthIn: 12, angleDeg: 90 },
          { label: "East return", lengthIn: 12, angleDeg: 90 },
          { label: "Nested stiffener (Row 5)", lengthIn: 6, angleDeg: 45 },
        ],
        notes: [
          "Flat pattern derived from tray unfold (0° bends) for CNC / waterjet.",
          "Outline matches site 3D tray stacking; confirm bend allowances before production.",
        ],
      },
    },
  },
  {
    id: "ORD-1002",
    customerId: "c1",
    customerName: "Lauren Customer",
    customerEmail: "lauren.customer@example.com",
    customerPhone: "(555) 014-2201",
    shippingAddress: {
      line1: "1420 Industrial Blvd",
      line2: "Suite 300",
      city: "Dallas",
      state: "TX",
      postalCode: "75207",
    },
    status: "Pending",
    createdAt: "2026-04-01",
    projectName: "Window Trim Set",
    measurements: {
      width: 36,
      height: 84,
      unit: "in",
    },
    material: "ACM",
    color: "Matte Black",
    previewImageSrc: "/portal-orders/ord-1002-preview.svg",
    lineItem: {
      id: "ORD-1002",
      standardId: null,
      widthIn: 36,
      heightIn: 84,
      colorId: "midnight-black",
      finishId: "standard",
      thicknessId: "4mm",
      quantity: 4,
      unitPrice: 285,
      areaFt2: (36 * 84) / 144,
      panelType: "basic",
      panelTypeLabel: "Basic Rectangular",
      boxTraySides: [],
      trayBuildSpec: `Row 1: Face blank | Edge: — | Return height: — | Single-plane window trim (field-verify jamb reveal)`,
    },
    cadMeasurements: {
      nominal: { widthIn: 36, heightIn: 84, unit: "in" },
      thicknessMm: 4,
      dxfUnits: "inches",
      flatPattern: {
        boundingWidthIn: 36,
        boundingLengthIn: 84,
        segments: [
          { label: "Trim face — width", lengthIn: 36 },
          { label: "Trim face — height", lengthIn: 84 },
          { label: "Miter reference — leg A", lengthIn: 18, angleDeg: 45 },
          { label: "Miter reference — leg B", lengthIn: 18, angleDeg: 45 },
        ],
        notes: ["Single-plane blank; verify field dimensions before release."],
      },
    },
  },
];

export function getDemoOrderById(orderId: string): OrderRecord | undefined {
  return demoOrders.find((o) => o.id === orderId);
}
