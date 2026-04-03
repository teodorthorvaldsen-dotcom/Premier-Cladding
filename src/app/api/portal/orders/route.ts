import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { demoOrders } from "@/lib/demoData";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role === "employee") {
    return NextResponse.json({ orders: demoOrders });
  }

  const customerOrders = demoOrders.filter((order) => order.customerId === user.customerId);

  return NextResponse.json({ orders: customerOrders });
}
