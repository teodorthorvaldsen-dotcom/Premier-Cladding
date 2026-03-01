"use client";

import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <p className="text-sm font-medium text-gray-900">
              All Cladding Solutions
            </p>
            <p className="mt-0.5 text-[13px] text-gray-500">
              © {year}. All rights reserved.
            </p>
          </div>
          <nav aria-label="Footer navigation">
            <ul className="flex items-center gap-8">
              <li>
                <Link
                  href="/contact"
                  className="text-[13px] text-gray-600 hover:text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-inset rounded"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-[13px] text-gray-600 hover:text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-inset rounded"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-[13px] text-gray-600 hover:text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-inset rounded"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <p className="mt-6 border-t border-gray-100 pt-6 text-center text-[12px] text-gray-400 sm:text-left">
          Quotes and lead times are confirmed upon review.
        </p>
      </div>
    </footer>
  );
}
