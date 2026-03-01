"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-gray-900">Something went wrong</h1>
      <p className="mt-2 text-sm text-gray-600">
        An error occurred while loading this page.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          Go home
        </Link>
      </div>
      {process.env.NODE_ENV === "development" && (
        <pre className="mt-6 max-h-40 overflow-auto rounded-lg bg-gray-100 p-3 text-left text-xs text-gray-700">
          {error.message}
        </pre>
      )}
    </div>
  );
}
