import { redirect } from "next/navigation";
import { PortalLogoutButton } from "@/components/PortalLogoutButton";
import { getSessionUser } from "@/lib/auth";
import { demoOrders } from "@/lib/demoData";

export default async function PortalPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const orders =
    user.role === "employee"
      ? demoOrders
      : demoOrders.filter((o) => o.customerId === user.customerId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Portal</h1>
          <p className="mt-1 text-sm text-gray-600">
            Signed in as {user.name} ({user.role})
          </p>
        </div>

        <PortalLogoutButton />
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{order.projectName}</h2>
                <p className="text-sm text-gray-500">Order ID: {order.id}</p>
                <p className="text-sm text-gray-500">Customer: {order.customerName}</p>
              </div>

              <div className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                {order.status}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Width</p>
                <p className="mt-1 text-lg font-semibold">
                  {order.measurements.width} {order.measurements.unit}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Height</p>
                <p className="mt-1 text-lg font-semibold">
                  {order.measurements.height} {order.measurements.unit}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Depth</p>
                <p className="mt-1 text-lg font-semibold">
                  {order.measurements.depth ?? "-"}{" "}
                  {order.measurements.depth != null ? order.measurements.unit : ""}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Created</p>
                <p className="mt-1 text-lg font-semibold">{order.createdAt}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Material</p>
                <p className="mt-1 text-base font-semibold">{order.material}</p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Color</p>
                <p className="mt-1 text-base font-semibold">{order.color}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
