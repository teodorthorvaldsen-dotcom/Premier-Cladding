import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PortalStaffOrderControls } from "@/components/PortalStaffOrderControls";
import { getSessionUser } from "@/lib/auth";
import { getPortalOrderById } from "@/lib/portalOrders";

type Props = { params: { orderId: string } };

export default async function PortalStaffOrderDetailPage({ params }: Props) {
  const orderId = decodeURIComponent(params.orderId);

  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/portal/${orderId}`)}`);
  }
  if (user.role !== "subcontractor" && user.role !== "admin") {
    redirect("/");
  }

  const order = getPortalOrderById(orderId);
  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/portal" className="text-sm font-medium text-gray-700 underline-offset-2 hover:text-gray-900 hover:underline">
        ← Back to orders
      </Link>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">{order.projectName}</h1>
        <p className="mt-1 text-sm text-gray-500">Order ID: {order.id}</p>
        <p className="mt-1 text-sm text-gray-600">
          {order.customerName} · {order.customerEmail}
        </p>

        <PortalStaffOrderControls order={order} showDetailLink={false} />
      </div>
    </div>
  );
}
