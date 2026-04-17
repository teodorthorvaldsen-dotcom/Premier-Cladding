import Link from "next/link";

export default function PortalOrderNotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">Order not found</h1>
      <p className="mt-2 text-sm text-gray-600">
        This order does not exist or you do not have access to it.
      </p>
      <Link
        href="/portal"
        className="mt-6 inline-block text-sm font-medium text-gray-900 underline-offset-4 hover:underline"
      >
        Return to order portal
      </Link>
    </div>
  );
}
