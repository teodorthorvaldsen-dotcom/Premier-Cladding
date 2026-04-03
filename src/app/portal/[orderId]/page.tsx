import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getDemoOrderById, type OrderRecord } from "@/lib/demoData";
import { PortalOrderDetailView } from "./PortalOrderDetailView";

function canAccessOrder(user: { role: string; customerId?: string }, order: OrderRecord) {
  if (user.role === "employee") return true;
  return order.customerId === user.customerId;
}

type PageProps = { params: { orderId: string } };

export default async function PortalOrderDetailPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const { orderId: rawId } = params;
  const orderId = decodeURIComponent(rawId);
  const order = getDemoOrderById(orderId);

  if (!order || !canAccessOrder(user, order)) {
    notFound();
  }

  return <PortalOrderDetailView order={order} />;
}
