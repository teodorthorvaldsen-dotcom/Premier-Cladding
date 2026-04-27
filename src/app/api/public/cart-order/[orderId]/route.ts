import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { tmpdir } from "os";
import jwt from "jsonwebtoken";

type PublicCartOrderRecord = {
  id: string;
  createdAt: string;
  fullName: string;
  company: string;
  email: string;
  phone: string;
  projectCity: string;
  projectState: string;
  notes: string;
  paymentMethod: "wire" | "credit";
  signature: string;
  items: unknown[];
};

function publicCartOrdersCandidates(): string[] {
  const candidates: string[] = [];
  const fromEnv = process.env.PORTAL_DATA_DIR?.trim();
  if (fromEnv) candidates.push(path.join(fromEnv, "public-cart-orders.jsonl"));
  candidates.push(path.join(process.cwd(), "data", "public-cart-orders.jsonl"));
  candidates.push(path.join(tmpdir(), "all-cladding-solutions-data", "public-cart-orders.jsonl"));
  return candidates;
}

async function loadOrderById(orderId: string): Promise<PublicCartOrderRecord | null> {
  for (const p of publicCartOrdersCandidates()) {
    try {
      const raw = await readFile(p, "utf-8");
      // JSONL: one order per line
      const lines = raw.split("\n").filter(Boolean);
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];
        try {
          const parsed = JSON.parse(line) as PublicCartOrderRecord;
          if (parsed && typeof parsed === "object" && parsed.id === orderId) return parsed;
        } catch {
          // ignore malformed line
        }
      }
    } catch {
      // file doesn't exist in this location
    }
  }
  return null;
}

function isAuthorized(req: NextRequest, orderId: string): boolean {
  const token = req.nextUrl.searchParams.get("t") ?? "";
  const secret = process.env.ORDER_VIEW_SECRET?.trim();
  if (!token || !secret) return false;
  try {
    const decoded = jwt.verify(token, secret) as { orderId?: unknown };
    return typeof decoded?.orderId === "string" && decoded.orderId === orderId;
  } catch {
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const orderId = params.orderId;
  if (!isAuthorized(request, orderId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const record = await loadOrderById(orderId);
  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, order: record });
}

