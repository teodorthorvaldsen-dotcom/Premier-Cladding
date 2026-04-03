export type Role = "customer" | "employee";

export type UserRecord = {
  id: string;
  email: string;
  password: string;
  role: Role;
  customerId?: string;
  name: string;
};

export type OrderRecord = {
  id: string;
  customerId: string;
  customerName: string;
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
  },
  {
    id: "ORD-1002",
    customerId: "c1",
    customerName: "Lauren Customer",
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
  },
];
