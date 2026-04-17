import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getRegistryAccountById, loadDynamicOrders } from "@/lib/portalPersistence";
import { demoOrders } from "@/lib/demoData";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return iso;
  }
}

export default async function PortalAdminAccountDetailPage({
  params,
}: {
  params: { accountId: string };
}) {
  const viewer = await getSessionUser();
  if (!viewer) redirect("/login?next=/portal/admin/accounts");
  if (viewer.role !== "admin" && viewer.role !== "subcontractor") redirect("/portal");

  const accountId = decodeURIComponent(params.accountId);
  const account = getRegistryAccountById(accountId);
  if (!account) notFound();

  const emailKey = account.email.trim().toLowerCase();
  const all = [...demoOrders, ...loadDynamicOrders()];
  const orders = all
    .filter(
      (o) =>
        (account.customerId && o.customerId === account.customerId) ||
        o.customerEmail.trim().toLowerCase() === emailKey
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/portal/admin/accounts"
          className="text-sm font-medium text-gray-700 underline underline-offset-2 hover:text-gray-900"
        >
          ← Back to accounts
        </Link>
      </div>

      <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">{account.name}</h1>
        <p className="mt-1 text-sm text-gray-600">{account.email}</p>
        <div className="mt-4 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
          <div>
            <span className="font-medium text-gray-900">Role:</span> {account.role}
          </div>
          <div>
            <span className="font-medium text-gray-900">Created:</span> {formatDate(account.createdAt)}
          </div>
          {account.company ? (
            <div className="sm:col-span-2">
              <span className="font-medium text-gray-900">Company:</span> {account.company}
            </div>
          ) : null}
          {account.customerId ? (
            <div className="sm:col-span-2">
              <span className="font-medium text-gray-900">Customer ID:</span> {account.customerId}
            </div>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Orders</h2>
          <p className="mt-0.5 text-xs text-gray-600">{orders.length} total</p>
        </div>
        {orders.length === 0 ? (
          <div className="px-4 py-10 text-sm text-gray-600">No orders found for this account yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/portal/${encodeURIComponent(o.id)}`}
                  className="block px-4 py-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{o.projectName}</p>
                      <p className="text-xs text-gray-500">
                        {o.id} · {o.status} · {o.createdAt}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-800">
                      {o.measurements.width}×{o.measurements.height} {o.measurements.unit} · {o.color}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

