"use client";

import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-[max(3rem,calc(0.75rem+env(safe-area-inset-bottom,0px)))] sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <p className="text-base font-medium text-gray-900">
              Premier Cladding
            </p>
            <p className="mt-1 text-sm text-gray-500">
              © {year}. All rights reserved.
            </p>
          </div>
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
              <li>
                <Link
                  href="/about#about-contact"
                  className="text-sm text-gray-600 hover:text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-inset rounded sm:text-base"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-600 hover:text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-inset rounded sm:text-base"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-600 hover:text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-inset rounded sm:text-base"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <p className="mt-6 border-t border-gray-100 pt-6 text-center text-sm text-gray-400 sm:text-left">
          Quotes and lead times are confirmed upon review.
        </p>
      </div>
    </footer>
  );
}
