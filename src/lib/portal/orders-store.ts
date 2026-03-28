import { readFile, writeFile, appendFile, mkdir } from "fs/promises";
import path from "path";
import type { PortalOrder, OrderStatus } from "@/types/portal";
import type { SessionUser } from "./session";

const ORDERS_JSONL_PATH = path.join(process.cwd(), "data", "orders.jsonl");

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function appendOrder(order: PortalOrder): Promise<void> {
  const dir = path.dirname(ORDERS_JSONL_PATH);
  await mkdir(dir, { recursive: true });
  await appendFile(ORDERS_JSONL_PATH, `${JSON.stringify(order)}\n`, "utf8");
}

export async function readAllOrders(): Promise<PortalOrder[]> {
  try {
    const raw = await readFile(ORDERS_JSONL_PATH, "utf8");
    const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
    return lines.map((line) => JSON.parse(line) as PortalOrder);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
}

export async function listOrdersForUser(user: SessionUser): Promise<PortalOrder[]> {
  const all = await readAllOrders();
  const sorted = [...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (user.role === "employee") return sorted;
  const em = normalizeEmail(user.email);
  return sorted.filter((o) => normalizeEmail(o.customerEmail) === em);
}

export async function getOrderById(id: string): Promise<PortalOrder | null> {
  const all = await readAllOrders();
  return all.find((o) => o.id === id) ?? null;
}

export function canAccessOrder(user: SessionUser, order: PortalOrder): boolean {
  if (user.role === "employee") return true;
  return normalizeEmail(user.email) === normalizeEmail(order.customerEmail);
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<PortalOrder | null> {
  const all = await readAllOrders();
  const idx = all.findIndex((o) => o.id === orderId);
  if (idx === -1) return null;
  const updated = { ...all[idx], status };
  const next = [...all.slice(0, idx), updated, ...all.slice(idx + 1)];
  await writeFile(
    ORDERS_JSONL_PATH,
    next.map((o) => JSON.stringify(o)).join("\n") + (next.length ? "\n" : ""),
    "utf8"
  );
  return updated;
}
