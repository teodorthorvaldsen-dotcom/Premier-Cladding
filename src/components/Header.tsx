"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { usePortalSession } from "@/hooks/usePortalSession";

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
  { id: "portal-login", label: "Staff login", href: "/login" },
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
      className={`whitespace-normal rounded-lg px-5 py-3.5 text-center text-xl font-bold leading-snug tracking-wide focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-inset md:px-6 md:py-4 md:text-2xl ${
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
        className={`whitespace-normal rounded-lg px-5 py-3.5 text-center text-xl font-bold leading-snug tracking-wide focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-inset md:px-6 md:py-4 md:text-2xl ${
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
          className="absolute left-0 z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-gray-200 bg-white p-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.1)] max-h-[min(60vh,26rem)] overflow-y-auto overscroll-contain"
        >
          <ul className="space-y-1">
            {items.map((it) => (
              <li key={it.id}>
                <Link
                  href={it.href}
                  role="menuitem"
                  className="block rounded-xl px-3 py-3 text-base font-semibold text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-inset"
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
  const { isStaff } = usePortalSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuId = useId();

  const navItems = NAV_ITEMS.map((item) => {
    if ("href" in item && item.id === "portal-login") {
      return {
        ...item,
        label: isStaff ? "Staff portal" : "Staff login",
        href: isStaff ? "/portal" : "/login",
      };
    }
    return item;
  });

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
            <div className="mx-auto flex w-full max-w-[min(100%,1920px)] justify-center px-5 py-4 sm:px-8 sm:py-5 lg:px-12 lg:py-6">
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
                  className="h-44 w-[min(1400px,95vw)] max-w-full object-contain object-center mix-blend-multiply sm:h-[12rem] sm:w-[min(1550px,95vw)] md:h-[13rem] md:w-[min(1700px,95vw)] lg:h-56 lg:w-[min(1800px,96vw)] xl:h-[15rem] xl:w-[min(1900px,96vw)]"
                />
              </Link>
            </div>
          </div>
        ) : null}
        <div className={`relative z-[110] ${navBarClass}${navBarTopSafe}`}>
          <div
            className={`mx-auto flex w-full min-w-0 max-w-[min(100%,1920px)] flex-col gap-3 px-4 py-3 sm:gap-3 sm:px-6 sm:py-3.5 lg:flex-row lg:items-center lg:gap-4 lg:px-10 lg:py-4 ${
              isHome ? "lg:justify-center" : "lg:justify-between"
            }`}
          >
            {/* Mobile: logo + actions (home: logo row above; toolbar row is nav + cart only) */}
            <div
              className={`flex min-w-0 items-center gap-3 lg:contents ${
                isHome ? "justify-end md:hidden" : "justify-between"
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
                    className="h-20 max-h-20 w-auto object-contain object-left mix-blend-multiply sm:h-24 sm:max-h-24 md:h-[5.5rem] md:max-h-[5.5rem] lg:h-28 lg:max-h-28"
                    priority
                    unoptimized
                  />
                </Link>
              ) : null}

              <div className="flex shrink-0 items-center gap-2.5 md:hidden">
                <Link
                  href="/cart"
                  className="rounded-lg px-3 py-2 text-center text-sm font-semibold tracking-wide text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-inset min-[360px]:text-base"
                  aria-label={`Cart: ${totalCount} item${totalCount !== 1 ? "s" : ""}`}
                  onClick={() => setMobileOpen(false)}
                >
                  Cart{totalCount > 0 ? ` (${totalCount})` : ""}
                </Link>
                <button
                  type="button"
                  className="inline-flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 min-[360px]:px-4 min-[360px]:text-base"
                  aria-expanded={mobileOpen}
                  aria-controls={menuId}
                  onClick={() => setMobileOpen((o) => !o)}
                >
                  {mobileOpen ? "Close" : "Menu"}
                </button>
              </div>
            </div>

            <nav
              className="hidden w-full min-w-0 flex-1 flex-wrap items-stretch justify-evenly gap-x-4 gap-y-2 md:flex md:gap-x-6 lg:gap-x-10"
              aria-label="Main"
            >
              {navItems.map((item) => {
                if ("href" in item) {
                  const active = itemIsActive(pathname ?? "", item.href);
                  const label =
                    item.id === "cart" ? `Cart${totalCount > 0 ? ` (${totalCount})` : ""}` : item.label;
                  return <DesktopLink key={item.id} href={item.href} label={label} active={active} />;
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
                {navItems.map((item) => {
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
