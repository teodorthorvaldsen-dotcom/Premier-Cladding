"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/about", label: "About" },
  { href: "/about/technical-resources", label: "Technical resources" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/about") return pathname === "/about";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AboutSubnav() {
  const pathname = usePathname() ?? "";

  return (
    <nav aria-label="About" className="border-b border-gray-200/80 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-2 overflow-x-auto py-4">
          {TABS.map((tab) => {
            const active = isActive(pathname, tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-[15px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
                  active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

