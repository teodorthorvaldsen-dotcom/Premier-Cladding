import { notFound, redirect } from "next/navigation";
import { getSessionUser, type SessionUser } from "@/lib/auth";
import type { OrderRecord } from "@/lib/demoData";
import { getPortalOrderById } from "@/lib/portalOrders";
import { PortalOrderDetailView } from "./PortalOrderDetailView";

function canAccessOrder(user: SessionUser, order: OrderRecord) {
  if (user.role === "employee" || user.role === "admin") return true;
  if (order.customerId === user.customerId) return true;
  return order.customerEmail.trim().toLowerCase() === user.email.trim().toLowerCase();
}

type PageProps = { params: { orderId: string } };

export default async function PortalOrderDetailPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const { orderId: rawId } = params;
  const orderId = decodeURIComponent(rawId);
  const order = getPortalOrderById(orderId);

  if (!order || !canAccessOrder(user, order)) {
    notFound();
  }

  return (
    <PortalOrderDetailView
      order={order}
      showCadExport={user.role === "employee" || user.role === "admin"}
      showOrderTimeline={user.role !== "employee"}
    />
  );
}
