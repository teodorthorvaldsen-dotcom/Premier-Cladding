import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

export type StoredOrder = {
  id: string;
  customer_name: string;
  customer_email: string;
  company_name: string | null;
  customer_phone: string | null;
  order_title: string;
  order_details: string;
  order_status: string;
  created_at: string;
};

type OrdersFileShape = {
  orders: StoredOrder[];
};

let cachedDataDir: string | null = null;

function getDataDir(): string {
  if (cachedDataDir) return cachedDataDir;
  const fromEnv = process.env.PORTAL_DATA_DIR?.trim();
  if (fromEnv) {
    mkdirSync(fromEnv, { recursive: true });
    cachedDataDir = fromEnv;
    return cachedDataDir;
  }
  const cwdData = join(process.cwd(), "data");
  try {
    if (!existsSync(cwdData)) {
      mkdirSync(cwdData, { recursive: true });
    }
    const probe = join(cwdData, ".orders-write-test");
    writeFileSync(probe, "ok", "utf-8");
    unlinkSync(probe);
    cachedDataDir = cwdData;
  } catch {
    const fallback = join(tmpdir(), "all-cladding-solutions-data");
    mkdirSync(fallback, { recursive: true });
    cachedDataDir = fallback;
  }
  return cachedDataDir;
}

function ordersPath(): string {
  return join(getDataDir(), "orders.json");
}

export function listOrders(): StoredOrder[] {
  const path = ordersPath();
  if (!existsSync(path)) return [];
  try {
    const raw = readFileSync(path, "utf-8");
    const parsed = JSON.parse(raw) as Partial<OrdersFileShape>;
    return Array.isArray(parsed.orders) ? parsed.orders : [];
  } catch {
    return [];
  }
}

export function appendOrder(order: StoredOrder): void {
  const dir = getDataDir();
  mkdirSync(dir, { recursive: true });
  const existing = listOrders();
  const out: OrdersFileShape = { orders: [order, ...existing] };
  writeFileSync(ordersPath(), JSON.stringify(out, null, 2), "utf-8");
}

