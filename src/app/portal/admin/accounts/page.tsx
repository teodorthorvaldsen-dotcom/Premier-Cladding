import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listRegistryAccounts } from "@/lib/portalPersistence";
import { getPortalOrdersForUser } from "@/lib/portalOrders";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return iso;
  }
}

export default async function PortalAdminAccountsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/portal/admin/accounts");
  if (user.role !== "admin") redirect("/portal");

  const accounts = listRegistryAccounts();
  const allOrders = getPortalOrdersForUser(user);
  const ordersByEmail = new Map<string, number>();
  for (const o of allOrders) {
    const key = o.customerEmail.trim().toLowerCase();
    ordersByEmail.set(key, (ordersByEmail.get(key) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-2 rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-gray-900">Accounts</h1>
        <p className="text-sm text-gray-600">
          Admin view. Click an account to see details and orders.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="grid grid-cols-12 gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
          <div className="col-span-4">Name</div>
          <div className="col-span-4">Email</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-1 text-right">Orders</div>
          <div className="col-span-1 text-right">Created</div>
        </div>
        <ul className="divide-y divide-gray-100">
          {accounts.map((a) => {
            const count = ordersByEmail.get(a.email.trim().toLowerCase()) ?? 0;
            return (
              <li key={a.id}>
                <Link
                  href={`/portal/admin/accounts/${encodeURIComponent(a.id)}`}
                  className="grid grid-cols-12 gap-2 px-4 py-3 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <div className="col-span-4 font-medium text-gray-900">{a.name}</div>
                  <div className="col-span-4 truncate text-gray-700">{a.email}</div>
                  <div className="col-span-2 text-gray-700">{a.role}</div>
                  <div className="col-span-1 text-right tabular-nums text-gray-700">{count}</div>
                  <div className="col-span-1 text-right tabular-nums text-gray-500">
                    {formatDate(a.createdAt)}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

