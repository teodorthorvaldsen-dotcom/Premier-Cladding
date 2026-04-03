import { randomUUID } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import bcrypt from "bcryptjs";
import { demoUsers } from "@/lib/demoData";
import type { OrderRecord } from "@/lib/demoData";

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

type RegistryFileShape = { customers: StoredCustomer[] };
type OrdersFileShape = { orders: OrderRecord[] };

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readRegistry(): RegistryFileShape {
  ensureDataDir();
  if (!existsSync(REGISTRY_FILE)) {
    return { customers: [] };
  }
  try {
    const raw = readFileSync(REGISTRY_FILE, "utf-8");
    const parsed = JSON.parse(raw) as RegistryFileShape;
    if (!Array.isArray(parsed.customers)) return { customers: [] };
    return parsed;
  } catch {
    return { customers: [] };
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

export type VerifiedRegisteredCustomer = {
  id: string;
  email: string;
  role: "customer";
  name: string;
  customerId: string;
};

export function verifyRegisteredCustomer(
  email: string,
  password: string
): VerifiedRegisteredCustomer | null {
  const n = email.trim().toLowerCase();
  const { customers } = readRegistry();
  const row = customers.find((c) => c.email.toLowerCase() === n);
  if (!row) return null;
  const ok = bcrypt.compareSync(password, row.passwordHash);
  if (!ok) return null;
  return {
    id: row.id,
    email: row.email,
    role: "customer",
    name: row.name,
    customerId: row.customerId,
  };
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
  writeRegistry(registry);
  return { ok: true, customerId };
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
