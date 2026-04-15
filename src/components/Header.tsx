"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";

type NavItem =
  | { id: string; label: string; href: string }
  | { id: string; label: string; items: { id: string; label: string; href: string }[] };

const NAV_ITEMS: NavItem[] = [
  {
    id: "acm-panels",
    label: "ACM Panels",
    items: [
      { id: "acm-configurator", label: "ACM Panel Configurator", href: "/products/acm-panels" },
      { id: "acm-tech-resources", label: "ACM Technical Resources", href: "/products/acm-panels/technical-resources" },
      { id: "acm-system", label: "Our ACM System", href: "/products/acm-panels/system" },
    ],
  },
  {
    id: "installment",
    label: "Installment",
    items: [
      { id: "installment-kit", label: "Installment Kit Configurator", href: "/installment-kit-configurator" },
      { id: "installment-videos", label: "Installment Videos", href: "/installment-videos" },
    ],
  },
  { id: "acm-stock", label: "ACM Stock", href: "/stock-material" },
  {
    id: "drawings-consultations",
    label: "Our Services",
    items: [
      { id: "drawings", label: "Custom Shop Drawings", href: "/custom-shop-drawings" },
      { id: "consultations", label: "Consultation", href: "/consultation" },
    ],
  },
  { id: "about", label: "About", href: "/about" },
  { id: "portal-login", label: "Portal Login", href: "/login" },
  { id: "cart", label: "Cart", href: "/cart" },
] as const;

function itemIsActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function groupIsActive(pathname: string, item: Extract<NavItem, { items: unknown }>): boolean {
  return item.items.some((i) => itemIsActive(pathname, i.href));
}

function DesktopLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`max-w-[9rem] whitespace-normal rounded-md px-2 py-1.5 text-center text-xs font-semibold leading-tight tracking-wide focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-inset sm:max-w-[10rem] sm:text-sm md:max-w-[11rem] md:px-2.5 ${
        active ? "text-gray-900" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

function DesktopDropdown({
  label,
  active,
  items,
}: {
  label: string;
  active: boolean;
  items: { id: string; label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const root = rootRef.current;
      if (!root) return;
      const target = e.target as Node | null;
      if (target && !root.contains(target)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown, true);
    document.addEventListener("touchstart", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown, true);
      document.removeEventListener("touchstart", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={`max-w-[9rem] whitespace-normal rounded-md px-2 py-1.5 text-center text-xs font-semibold leading-tight tracking-wide focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-inset sm:max-w-[10rem] sm:text-sm md:max-w-[11rem] md:px-2.5 ${
          active ? "text-gray-900" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${label} menu`}
        onClick={() => setOpen((o) => !o)}
      >
        {label}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute left-1/2 z-50 mt-1.5 w-[min(22rem,90vw)] -translate-x-1/2 rounded-xl border border-gray-200 bg-white p-2 shadow-[0_12px_40px_rgba(0,0,0,0.1)]"
        >
          <ul className="space-y-1">
            {items.map((it) => (
              <li key={it.id}>
                <Link
                  href={it.href}
                  role="menuitem"
                  className="block rounded-xl px-3 py-2.5 text-[15px] font-semibold text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-inset"
                  onClick={() => setOpen(false)}
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { totalCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuId = useId();

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

  const navBarClass =
    "border-b border-gray-200/60 bg-[#f9fafb] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]";
  const navBarTopSafe = isHome ? "" : " pt-[env(safe-area-inset-top)]";

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-gray-900 focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
      >
        Skip to content
      </a>
      <header className="relative z-40">
        {mobileOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-[100] bg-black/25 md:hidden"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}
        {isHome ? (
          <div className="relative z-[110] border-b border-gray-200 bg-white pt-[env(safe-area-inset-top)]">
            <div className="mx-auto flex max-w-7xl justify-center px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5">
              <Link
                href="/"
                className="inline-block focus:outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
                aria-label="Premier Cladding home"
                onClick={() => setMobileOpen(false)}
              >
                <Image
                  src="/logo.png"
                  alt="Premier Cladding"
                  width={840}
                  height={216}
                  priority
                  unoptimized
                  className="h-36 w-auto max-w-full object-contain object-center mix-blend-multiply sm:h-[10.5rem] md:h-[11.25rem] lg:h-48 xl:h-48"
                />
              </Link>
            </div>
          </div>
        ) : null}
        <div className={`relative z-[110] ${navBarClass}${navBarTopSafe}`}>
          <div
            className={`mx-auto flex w-full min-w-0 max-w-[100vw] flex-col gap-2 px-3 py-2 sm:gap-2 sm:px-4 sm:py-2.5 lg:flex-row lg:items-center lg:gap-3 lg:px-6 lg:py-2.5 ${
              isHome ? "lg:justify-center" : "lg:justify-between"
            }`}
          >
            {/* Mobile: logo + actions (home: logo row above; toolbar row is nav + cart only) */}
            <div
              className={`flex min-w-0 items-center gap-3 lg:contents ${
                isHome ? "justify-end" : "justify-between"
              }`}
            >
              {!isHome ? (
                <Link
                  href="/"
                  className="relative flex min-w-0 flex-1 items-center bg-transparent focus:outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f9fafb] lg:flex-none lg:justify-start"
                  aria-label="Premier Cladding home"
                  onClick={() => setMobileOpen(false)}
                >
                  <Image
                    src="/logo.png"
                    alt="Premier Cladding"
                    width={840}
                    height={216}
                    className="h-12 max-h-12 w-auto object-contain object-left mix-blend-multiply sm:h-14 sm:max-h-14 md:h-[3.75rem] md:max-h-[3.75rem] lg:h-16 lg:max-h-16"
                    priority
                    unoptimized
                  />
                </Link>
              ) : null}

              <div className="flex shrink-0 items-center gap-2 lg:hidden">
                <Link
                  href="/cart"
                  className="rounded-md px-2 py-1.5 text-center text-xs font-semibold tracking-wide text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-inset min-[360px]:text-sm"
                  aria-label={`Cart: ${totalCount} item${totalCount !== 1 ? "s" : ""}`}
                  onClick={() => setMobileOpen(false)}
                >
                  Cart{totalCount > 0 ? ` (${totalCount})` : ""}
                </Link>
                <button
                  type="button"
                  className="inline-flex min-h-[36px] min-w-[36px] touch-manipulation items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 min-[360px]:px-3 min-[360px]:text-sm"
                  aria-expanded={mobileOpen}
                  aria-controls={menuId}
                  onClick={() => setMobileOpen((o) => !o)}
                >
                  {mobileOpen ? "Close" : "Menu"}
                </button>
              </div>
            </div>

            <nav
              className="hidden min-w-0 flex-1 flex-wrap items-center justify-center gap-x-1 gap-y-1 md:flex md:gap-x-1.5 lg:gap-x-2"
              aria-label="Main"
            >
              {NAV_ITEMS.map((item) => {
                if ("href" in item) {
                  const active = itemIsActive(pathname ?? "", item.href);
                  return <DesktopLink key={item.id} href={item.href} label={item.label} active={active} />;
                }
                const active = groupIsActive(pathname ?? "", item);
                return <DesktopDropdown key={item.id} label={item.label} active={active} items={item.items} />;
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
                {NAV_ITEMS.map((item) => {
                  if ("href" in item) {
                    const active = itemIsActive(pathname ?? "", item.href);
                    return (
                      <li key={item.id}>
                        <Link
                          href={item.href}
                          className={`block touch-manipulation rounded-lg px-3 py-3 text-left text-base font-bold leading-snug break-words active:bg-gray-100 ${
                            active ? "text-gray-900" : "text-gray-700"
                          }`}
                          onClick={() => setMobileOpen(false)}
                          aria-current={active ? "page" : undefined}
                        >
                          {item.label}
                          {item.id === "cart" && totalCount > 0 ? ` (${totalCount})` : ""}
                        </Link>
                      </li>
                    );
                  }
                  const activeGroup = groupIsActive(pathname ?? "", item);
                  return (
                    <li key={item.id}>
                      <details className="rounded-lg">
                        <summary
                          className={`list-none cursor-pointer touch-manipulation rounded-lg px-3 py-3 text-left text-base font-bold leading-snug active:bg-gray-100 ${
                            activeGroup ? "text-gray-900" : "text-gray-700"
                          }`}
                        >
                          {item.label}
                        </summary>
                        <ul className="mt-1 space-y-1 pl-3">
                          {item.items.map((sub) => {
                            const active = itemIsActive(pathname ?? "", sub.href);
                            return (
                              <li key={sub.id}>
                                <Link
                                  href={sub.href}
                                  className={`block rounded-lg px-3 py-2.5 text-[15px] font-semibold ${
                                    active ? "text-gray-900" : "text-gray-700"
                                  } hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400`}
                                  onClick={() => setMobileOpen(false)}
                                  aria-current={active ? "page" : undefined}
                                >
                                  {sub.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </details>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
