import Link from "next/link";
import { getSessionFromCookies } from "@/lib/portal/session";
import { listOrdersForUser } from "@/lib/portal/orders-store";
import { ORDER_STATUS_LABELS } from "@/types/portal";

export const dynamic = "force-dynamic";

function formatShortDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default async function PortalDashboardPage() {
  const user = await getSessionFromCookies();
  if (!user) return null;

  const orders = await listOrdersForUser(user);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">Orders</h1>
      <p className="mt-2 text-[15px] text-gray-600">
        {user.role === "employee"
          ? "All customer orders submitted through the configurator or cart checkout."
          : "Orders tied to your email address. Register or sign in with the same email you used when submitting a request."}
      </p>

      {orders.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-gray-200 bg-white p-8 text-center text-[15px] text-gray-600">
          No orders yet.{" "}
          <Link href="/products/acm-panels" className="font-medium text-gray-900 underline hover:text-gray-700">
            Configure panels
          </Link>{" "}
          or{" "}
          <Link href="/cart" className="font-medium text-gray-900 underline hover:text-gray-700">
            open your cart
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/portal/orders/${o.id}`}
                className="block rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition hover:border-gray-300 hover:shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm text-gray-500">{o.id}</p>
                    <p className="mt-1 font-medium text-gray-900">{o.summary}</p>
                    <p className="mt-0.5 text-sm text-gray-600">
                      {o.fullName}
                      {user.role === "employee" && (
                        <>
                          {" "}
                          · <span className="text-gray-900">{o.customerEmail}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p className="font-medium text-gray-900">{ORDER_STATUS_LABELS[o.status]}</p>
                    <p className="mt-0.5">{formatShortDate(o.createdAt)}</p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
