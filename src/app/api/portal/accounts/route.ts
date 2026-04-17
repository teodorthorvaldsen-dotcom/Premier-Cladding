import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { listRegistryAccounts } from "@/lib/portalPersistence";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== "admin" && user.role !== "subcontractor")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return NextResponse.json({ accounts: listRegistryAccounts() });
}
