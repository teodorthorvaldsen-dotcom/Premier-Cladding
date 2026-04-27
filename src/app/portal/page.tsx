import Link from "next/link";
import { redirect } from "next/navigation";
import { PortalLogoutButton } from "@/components/PortalLogoutButton";
import { PortalStaffDashboard } from "@/components/PortalStaffDashboard";
import { getSessionUser } from "@/lib/auth";
import { listRegistryAccounts } from "@/lib/portalPersistence";
import { getPortalOrdersForUser } from "@/lib/portalOrders";

export default async function PortalPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login?next=%2Fportal");
  }

  const isStaff = user.role === "subcontractor" || user.role === "admin";
  if (!isStaff) {
    redirect("/");
  }

  const orders = getPortalOrdersForUser(user);
  const accounts = user.role === "admin" ? listRegistryAccounts() : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Staff portal</h1>
          <p className="mt-1 text-sm text-gray-600">
            Signed in as {user.name} ({user.role})
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Select an order for details, job stage, and measurements. Customer self-service portal sign-in is disabled.
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
        showAccountsTab={user.role === "admin"}
        showInsuranceTab={user.role === "subcontractor" || user.role === "admin"}
      />
    </div>
  );
}
