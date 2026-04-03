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
  /** Static asset under /public (same role as cart `previewImageDataUrl` snapshots). */
  previewImageSrc: string;
  cadMeasurements: CadMeasurements;
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
      width: 48,
      height: 96,
      depth: 2,
      unit: "in",
    },
    material: "ACM",
    color: "Iridium Silver",
    previewImageSrc: "/portal-orders/ord-1001-preview.svg",
    cadMeasurements: {
      nominal: { widthIn: 48, heightIn: 96, depthIn: 2, unit: "in" },
      thicknessMm: 4,
      dxfUnits: "inches",
      flatPattern: {
        boundingWidthIn: 52,
        boundingLengthIn: 100,
        segments: [
          { label: "Face — width", lengthIn: 48 },
          { label: "Face — height", lengthIn: 96 },
          { label: "South return", lengthIn: 2, angleDeg: 90 },
          { label: "North return", lengthIn: 2, angleDeg: 90 },
          { label: "Hem / break line offset from reference edge", lengthIn: 0.75 },
        ],
        notes: [
          "Flat pattern derived from tray unfold (0° bends) for CNC / waterjet.",
          "Add standard break allowance per shop standards unless noted.",
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
