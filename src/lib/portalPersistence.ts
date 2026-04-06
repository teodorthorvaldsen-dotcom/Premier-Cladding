import { randomUUID } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import bcrypt from "bcryptjs";
import { demoUsers } from "@/lib/demoData";
import type { OrderRecord, Role } from "@/lib/demoData";

const DATA_DIR = join(process.cwd(), "data");
const REGISTRY_FILE = join(DATA_DIR, "portal-registry.json");
const ORDERS_FILE = join(DATA_DIR, "portal-quote-orders.json");

type StoredCustomer = {
  id: string;
  customerId: string;
  email: string;
  passwordHash: string;
  name: string;
  company: string;
  createdAt: string;
};

type StoredEmployee = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
};

type StoredAdmin = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
};

type RegistryFileShape = {
  customers: StoredCustomer[];
  employees: StoredEmployee[];
  admins: StoredAdmin[];
};
type OrdersFileShape = { orders: OrderRecord[] };

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readRegistry(): RegistryFileShape {
  ensureDataDir();
  if (!existsSync(REGISTRY_FILE)) {
    return { customers: [], employees: [], admins: [] };
  }
  try {
    const raw = readFileSync(REGISTRY_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<RegistryFileShape>;
    const customers = Array.isArray(parsed.customers) ? parsed.customers : [];
    const employees = Array.isArray(parsed.employees) ? parsed.employees : [];
    const admins = Array.isArray(parsed.admins) ? parsed.admins : [];
    return { customers, employees, admins };
  } catch {
    return { customers: [], employees: [], admins: [] };
  }
}

function writeRegistry(data: RegistryFileShape) {
  ensureDataDir();
  writeFileSync(REGISTRY_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function readDynamicOrders(): OrdersFileShape {
  ensureDataDir();
  if (!existsSync(ORDERS_FILE)) {
    return { orders: [] };
  }
  try {
    const raw = readFileSync(ORDERS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as OrdersFileShape;
    if (!Array.isArray(parsed.orders)) return { orders: [] };
    return parsed;
  } catch {
    return { orders: [] };
  }
}

function writeDynamicOrders(data: OrdersFileShape) {
  ensureDataDir();
  writeFileSync(ORDERS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export function isReservedPortalEmail(email: string): boolean {
  const n = email.trim().toLowerCase();
  return demoUsers.some((u) => u.email.toLowerCase() === n);
}

export function findDemoCustomerIdByEmail(email: string): string | undefined {
  const n = email.trim().toLowerCase();
  const u = demoUsers.find((x) => x.email.toLowerCase() === n && x.role === "customer");
  return u?.customerId;
}

export type RegistryPortalSession = {
  id: string;
  email: string;
  role: Role;
  name: string;
  customerId?: string;
};

/** File-backed portal users (bcrypt). Used on deploy after npm install seeds the registry. */
export function verifyRegistryPortalLogin(
  email: string,
  password: string
): RegistryPortalSession | null {
  try {
    const n = email.trim().toLowerCase();
    const { customers, employees, admins } = readRegistry();
    const cust = customers.find((c) => c.email.toLowerCase() === n);
    if (cust && bcrypt.compareSync(password, cust.passwordHash)) {
      return {
        id: cust.id,
        email: cust.email,
        role: "customer",
        name: cust.name,
        customerId: cust.customerId,
      };
    }
    const emp = employees.find((e) => e.email.toLowerCase() === n);
    if (emp && bcrypt.compareSync(password, emp.passwordHash)) {
      return {
        id: emp.id,
        email: emp.email,
        role: "employee",
        name: emp.name,
      };
    }
    const admin = admins.find((a) => a.email.toLowerCase() === n);
    if (admin && bcrypt.compareSync(password, admin.passwordHash)) {
      return {
        id: admin.id,
        email: admin.email,
        role: "admin",
        name: admin.name,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/** Standalone registration; fails if email already in registry or is a reserved demo email. */
export function registerPortalCustomer(input: {
  name: string;
  email: string;
  company: string;
  password: string;
}): { ok: true; customerId: string } | { ok: false; error: string } {
  const email = input.email.trim().toLowerCase();
  if (!email.includes("@")) {
    return { ok: false, error: "Valid email is required." };
  }
  if (isReservedPortalEmail(email)) {
    return { ok: false, error: "This email is reserved. Use the demo login or a different email." };
  }
  if (input.password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }
  const registry = readRegistry();
  if (registry.customers.some((c) => c.email.toLowerCase() === email)) {
    return { ok: false, error: "An account with this email already exists. Sign in instead." };
  }
  if (registry.employees.some((e) => e.email.toLowerCase() === email)) {
    return { ok: false, error: "An account with this email already exists. Sign in instead." };
  }
  if (registry.admins.some((a) => a.email.toLowerCase() === email)) {
    return { ok: false, error: "An account with this email already exists. Sign in instead." };
  }

  const customerId = `reg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const id = randomUUID();
  const passwordHash = bcrypt.hashSync(input.password, 10);
  registry.customers.push({
    id,
    customerId,
    email,
    passwordHash,
    name: input.name.trim(),
    company: input.company.trim(),
    createdAt: new Date().toISOString(),
  });
  try {
    writeRegistry(registry);
    return { ok: true, customerId };
  } catch {
    return {
      ok: false,
      error:
        "Registration is temporarily unavailable on this deployment. Please contact support or try again later.",
    };
  }
}

export type PortalAccountSummary = {
  id: string;
  role: Role;
  email: string;
  name: string;
  company?: string;
  customerId?: string;
  createdAt: string;
};

export function listRegistryAccounts(): PortalAccountSummary[] {
  const r = readRegistry();
  const customers: PortalAccountSummary[] = r.customers.map((c) => ({
    id: c.id,
    role: "customer",
    email: c.email,
    name: c.name,
    company: c.company,
    customerId: c.customerId,
    createdAt: c.createdAt,
  }));
  const employees: PortalAccountSummary[] = r.employees.map((e) => ({
    id: e.id,
    role: "employee",
    email: e.email,
    name: e.name,
    createdAt: e.createdAt,
  }));
  const admins: PortalAccountSummary[] = r.admins.map((a) => ({
    id: a.id,
    role: "admin",
    email: a.email,
    name: a.name,
    createdAt: a.createdAt,
  }));

  const byEmail = new Map<string, PortalAccountSummary>();
  [...customers, ...employees, ...admins].forEach((u) => byEmail.set(u.email.toLowerCase(), u));
  // Include demo users as well (for local/dev). Never includes passwords.
  demoUsers.forEach((u) => {
    const key = u.email.toLowerCase();
    if (!byEmail.has(key)) {
      byEmail.set(key, {
        id: u.id,
        role: u.role,
        email: u.email,
        name: u.name,
        company: undefined,
        customerId: u.customerId,
        createdAt: new Date(0).toISOString(),
      });
    }
  });
  return Array.from(byEmail.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getRegistryAccountById(id: string): PortalAccountSummary | null {
  const r = readRegistry();
  const cust = r.customers.find((c) => c.id === id);
  if (cust) {
    return {
      id: cust.id,
      role: "customer",
      email: cust.email,
      name: cust.name,
      company: cust.company,
      customerId: cust.customerId,
      createdAt: cust.createdAt,
    };
  }
  const emp = r.employees.find((e) => e.id === id);
  if (emp) {
    return { id: emp.id, role: "employee", email: emp.email, name: emp.name, createdAt: emp.createdAt };
  }
  const admin = r.admins.find((a) => a.id === id);
  if (admin) {
    return { id: admin.id, role: "admin", email: admin.email, name: admin.name, createdAt: admin.createdAt };
  }
  return null;
}

/**
 * After a successful cart quote: ensure registry user (unless reserved demo email) and append portal order.
 * Skips persistence for reserved non-customer emails (e.g. employee demo).
 */
export function registerCustomerFromQuoteAndSaveOrder(input: {
  email: string;
  fullName: string;
  company: string;
  portalPassword: string;
  order: OrderRecord;
}): void {
  const email = input.email.trim().toLowerCase();
  const demoCustomerId = findDemoCustomerIdByEmail(input.email);

  if (isReservedPortalEmail(email) && !demoCustomerId) {
    return;
  }

  let customerId: string;
  if (demoCustomerId) {
    customerId = demoCustomerId;
  } else {
    if (input.portalPassword.length < 8) {
      throw new Error("Portal password must be at least 8 characters.");
    }
    const registry = readRegistry();
    const existing = registry.customers.find((c) => c.email.toLowerCase() === email);
    const passwordHash = bcrypt.hashSync(input.portalPassword, 10);

    if (existing) {
      existing.passwordHash = passwordHash;
      existing.name = input.fullName.trim();
      existing.company = input.company.trim();
      customerId = existing.customerId;
    } else {
      customerId = `reg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      registry.customers.push({
        id: randomUUID(),
        customerId,
        email,
        passwordHash,
        name: input.fullName.trim(),
        company: input.company.trim(),
        createdAt: new Date().toISOString(),
      });
    }
    writeRegistry(registry);
  }

  const ordersData = readDynamicOrders();
  const order = { ...input.order, customerId };
  ordersData.orders.push(order);
  writeDynamicOrders(ordersData);
}

export function loadDynamicOrders(): OrderRecord[] {
  return readDynamicOrders().orders;
}
