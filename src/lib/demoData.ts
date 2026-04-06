import type { CartItem } from "@/types/cart";
import type { JobStage } from "@/lib/jobStage";

export type Role = "customer" | "subcontractor" | "admin";

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

export type OrderRecord = {
  id: string;
  customerId: string;
  customerName: string;
  companyName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  status: "Pending" | "In Production" | "Completed" | "Shipped";
  /** Production workflow; optional overlay from persisted job stages. */
  jobStage?: JobStage;
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
    email: "subcontractor@example.com",
    password: "subcontractor123",
    role: "subcontractor",
    name: "Alex Subcontractor",
  },
  {
    id: "u3",
    email: "allcladdingsolutions@gmail.com",
    password: "gator825",
    role: "admin",
    name: "All Cladding Solutions",
  },
];

const ord1001TraySpec = `Side 1 · Front · 30" @ 90°
Side 2 · Right · 18" @ 90°
Side 3 · Back · 14" @ 90°
Side 4 · Left · 12" @ 90°
Side 1 (nested) · Front · 6" @ 45° · from Side 1`;

export const demoOrders: OrderRecord[] = [
  {
    id: "ORD-1001",
    customerId: "c1",
    customerName: "Lauren Customer",
    companyName: "Summit Facade Group LLC",
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
  },
  {
    id: "ORD-1002",
    customerId: "c1",
    customerName: "Lauren Customer",
    companyName: "Summit Facade Group LLC",
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
  },
];

export function getDemoOrderById(orderId: string): OrderRecord | undefined {
  return demoOrders.find((o) => o.id === orderId);
}
