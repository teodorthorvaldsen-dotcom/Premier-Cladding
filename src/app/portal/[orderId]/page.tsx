import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PortalOrderDetail } from "@/components/PortalOrderDetail";
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
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/portal" className="text-sm font-medium text-gray-700 underline-offset-2 hover:text-gray-900 hover:underline">
        ← Back to orders
      </Link>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">{order.projectName}</h1>
        <p className="mt-1 text-sm text-gray-500">Order ID: {order.id}</p>
        <p className="mt-1 text-sm text-gray-600">
          {order.customerName} · {order.customerEmail}
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/portal/acm-panels?orderId=${encodeURIComponent(order.id)}&line=0`}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2"
          >
            Open 3D panel workspace
          </Link>
          {(order.cartLineItems?.length ?? 0) > 1 ? (
            <div className="flex flex-wrap items-center gap-2">
              {order.cartLineItems?.map((_, i) => (
                <Link
                  key={i}
                  href={`/portal/acm-panels?orderId=${encodeURIComponent(order.id)}&line=${i}`}
                  className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50"
                >
                  Line {i + 1}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <PortalStaffOrderControls order={order} showDetailLink={false} />
      </div>

      <PortalOrderDetail order={order} />
    </div>
  );
}
