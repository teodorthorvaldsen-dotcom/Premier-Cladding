"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { useCart } from "@/context/CartContext";
import { usePortalSession } from "@/hooks/usePortalSession";

const ACM_PANEL_NAV = {
  id: "acm-panels",
  href: "/products/acm-panels",
  label: "ACM Panel Configurator",
} as const;

const PUBLIC_NAV_LINKS = [
  { id: "installment-kits", href: "/installment-kit-configurator", label: "Installment Kit Configurator" },
  { id: "stock-material", href: "/stock-material", label: "Stock Material" },
  { id: "installment-videos", href: "/installment-videos", label: "Installment Videos" },
  { id: "custom-shop-drawings", href: "/custom-shop-drawings", label: "Custom Shop Drawings" },
  { id: "consultation", href: "/consultation", label: "Consultation" },
  { id: "about", href: "/about", label: "About" },
  { id: "portal", href: "/login", label: "Order portal" },
  { id: "cart", href: "/cart", label: "Cart" },
] as const;

export function Header() {
  const pathname = usePathname();
  const { totalCount } = useCart();
  const { isEmployee } = usePortalSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuId = useId();

  const navLinks = isEmployee ? [ACM_PANEL_NAV, ...PUBLIC_NAV_LINKS] : [...PUBLIC_NAV_LINKS];

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const shellClass =
    "border-b border-gray-200/60 bg-[#f9fafb] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[env(safe-area-inset-top)]";

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-gray-900 focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40">
        {mobileOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-[100] bg-black/25 md:hidden"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}
        <div className={`relative z-[110] ${shellClass}`}>
          <div className="mx-auto flex w-full min-w-0 max-w-[100vw] flex-col gap-3 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-10 lg:py-8">
            {/* Mobile: logo + actions */}
            <div className="flex min-w-0 items-center justify-between gap-3 lg:contents">
              <Link
                href="/"
                className="relative flex min-w-0 flex-1 items-center bg-transparent focus:outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f9fafb] lg:flex-none lg:justify-start"
                aria-label="All Cladding Solutions home"
                onClick={() => setMobileOpen(false)}
              >
                <Image
                  src="/logo.png"
                  alt="All Cladding Solutions"
                  width={840}
                  height={216}
                  className="h-16 max-h-16 w-auto object-contain object-left mix-blend-multiply sm:h-24 sm:max-h-24 md:h-32 md:max-h-32 lg:h-56 lg:max-h-none xl:h-64"
                  priority
                  unoptimized
                />
              </Link>

              <div className="flex shrink-0 items-center gap-2 lg:hidden">
                <Link
                  href="/cart"
                  className="rounded-lg px-3 py-2.5 text-center text-sm font-bold tracking-wide text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-inset min-[360px]:text-base"
                  aria-label={`Cart: ${totalCount} item${totalCount !== 1 ? "s" : ""}`}
                  onClick={() => setMobileOpen(false)}
                >
                  Cart{totalCount > 0 ? ` (${totalCount})` : ""}
                </Link>
                <button
                  type="button"
                  className="inline-flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 min-[360px]:px-4 min-[360px]:text-base"
                  aria-expanded={mobileOpen}
                  aria-controls={menuId}
                  onClick={() => setMobileOpen((o) => !o)}
                >
                  {mobileOpen ? "Close" : "Menu"}
                </button>
              </div>
            </div>

            <nav
              className="hidden min-w-0 flex-1 flex-wrap items-center justify-center gap-x-2 gap-y-3 md:flex md:gap-x-3 lg:gap-x-4"
              aria-label="Main"
            >
              {navLinks.map(({ id, href, label }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={id}
                    href={href}
                    className={`max-w-[10rem] whitespace-normal rounded-lg px-3 py-2.5 text-center text-base font-bold leading-snug tracking-wide focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-inset sm:max-w-[11rem] md:max-w-[11.5rem] md:px-4 md:py-3 md:text-lg lg:max-w-[12rem] lg:text-lg xl:text-xl ${
                      active
                        ? "text-gray-900"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile navigation panel */}
            <nav
              id={menuId}
              className={`max-h-[min(75vh,28rem)] overflow-y-auto overscroll-contain border-t border-gray-200/80 pt-3 md:hidden ${
                mobileOpen ? "block" : "hidden"
              }`}
              aria-label="Mobile navigation"
            >
              <ul className="space-y-1">
                {navLinks.map(
                  ({ id, href, label }) => {
                    const active = pathname === href;
                    return (
                      <li key={id}>
                        <Link
                          href={href}
                          className={`block touch-manipulation rounded-lg px-3 py-3 text-left text-base font-bold leading-snug break-words active:bg-gray-100 ${
                            active ? "text-gray-900" : "text-gray-700"
                          }`}
                          onClick={() => setMobileOpen(false)}
                          aria-current={active ? "page" : undefined}
                        >
                          {label}
                          {id === "cart" && totalCount > 0 ? ` (${totalCount})` : ""}
                        </Link>
                      </li>
                    );
                  }
                )}
              </ul>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
