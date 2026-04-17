import Link from "next/link";
import { redirect } from "next/navigation";
import { JobProgressBar } from "@/components/JobProgressBar";
import { PortalLogoutButton } from "@/components/PortalLogoutButton";
import { PortalStaffDashboard } from "@/components/PortalStaffDashboard";
import { getSessionUser } from "@/lib/auth";
import { JOB_STAGE_LABEL } from "@/lib/jobStage";
import { listRegistryAccounts } from "@/lib/portalPersistence";
import { getPortalOrdersForUser } from "@/lib/portalOrders";

export default async function PortalPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const orders = getPortalOrdersForUser(user);
  const isStaff = user.role === "subcontractor" || user.role === "admin";

  if (isStaff) {
    const accounts = listRegistryAccounts();
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Order portal</h1>
            <p className="mt-1 text-sm text-gray-600">
              Signed in as {user.name} ({user.role})
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Select an order to open customer details, panel preview, and CAD measurements.
            </p>
            <div className="mt-4">
              <Link
                href="/portal/acm-panels"
                className="inline-flex items-center justify-center rounded-xl border-2 border-gray-900 bg-white px-5 py-3 text-[15px] font-medium text-gray-900 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Open ACM panel workspace
              </Link>
            </div>
          </div>

          <PortalLogoutButton />
        </div>

        <PortalStaffDashboard
          orders={orders}
          accounts={accounts}
          showInsuranceTab={user.role === "subcontractor"}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Order portal</h1>
          <p className="mt-1 text-sm text-gray-600">
            Signed in as {user.name} ({user.role})
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Select an order to open customer details, panel preview, and CAD measurements.
          </p>
          <p className="mt-3 max-w-2xl text-sm text-gray-600">
            <strong>Checking your request:</strong> After you submit a cart quote, sign in here with the same email and the{" "}
            <strong>order portal password</strong> you chose at checkout. New requests appear in this list as soon as your
            estimate submission succeeds.
          </p>
        </div>

        <PortalLogoutButton />
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/portal/${encodeURIComponent(order.id)}`}
            className="group block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm outline-none ring-black transition hover:border-gray-300 hover:shadow-md focus-visible:ring-2"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 group-hover:underline">{order.projectName}</h2>
                <p className="text-sm text-gray-500">Order ID: {order.id}</p>
                <p className="text-sm text-gray-500">Customer: {order.customerName}</p>
              </div>

              <div className="flex flex-col items-start gap-2 md:items-end">
                <div className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                  {order.status}
                </div>
                <span className="text-sm font-medium text-gray-900">View details →</span>
              </div>
            </div>

            <div className="mt-4 max-w-md">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Production progress</p>
              <p className="mt-1 text-sm text-gray-600">{JOB_STAGE_LABEL[order.jobStage ?? "ordering"]}</p>
              <div className="mt-2">
                <JobProgressBar stage={order.jobStage ?? "ordering"} />
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
          </Link>
        ))}
      </div>
    </div>
  );
}
