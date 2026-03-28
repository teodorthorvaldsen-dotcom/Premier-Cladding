import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/portal/session";
import { LogoutButton } from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function PortalAppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionFromCookies();
  if (!user) {
    redirect("/portal/login");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <Link href="/portal" className="text-lg font-semibold tracking-tight text-gray-900">
            Order portal
          </Link>
          <p className="mt-1 text-sm text-gray-600">
            <span className="text-gray-900">{user.email}</span>
            {user.role === "employee" && (
              <span className="ml-2 inline-block rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-800">
                Staff
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus-visible:underline"
          >
            Home
          </Link>
          <LogoutButton />
        </div>
      </div>
      {children}
    </div>
  );
}
