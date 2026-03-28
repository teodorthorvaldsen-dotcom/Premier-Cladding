"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

const NAV_LINKS = [
  { id: "acm-panels", href: "/products/acm-panels", label: "ACM Panel Configurator" },
  { id: "installment-kits", href: "/products/acm-panels", label: "Installment Kit Configurator" },
  { id: "stock-material", href: "/stock-material", label: "Stock Material" },
  { id: "installment-videos", href: "/installment-videos", label: "Installment Videos" },
  { id: "custom-shop-drawings", href: "/custom-shop-drawings", label: "Custom Shop Drawings" },
  { id: "consultation", href: "/consultation", label: "Consultation" },
  { id: "about", href: "/about", label: "About" },
  { id: "contact", href: "/contact", label: "Contact" },
  { id: "cart", href: "/cart", label: "Cart" },
] as const;

const CONFIGURATOR_LINKS = [
  { href: "#panel-type", label: "Panel Type" },
  { href: "#thickness", label: "Thickness" },
  { href: "#size", label: "Size" },
  { href: "#color", label: "Color/Finish" },
  { href: "#quantity", label: "Quantity" },
  { href: "#estimate", label: "Total" },
  { href: "/cart", label: "Cart" },
] as const;

/** Instant scroll on ACM configurator — normal page scroll, no smooth “slide”. */
function scrollToSection(
  e: React.MouseEvent<HTMLAnchorElement>,
  href: string,
  behavior: ScrollBehavior = "smooth"
) {
  if (href.startsWith("#")) {
    e.preventDefault();
    document.getElementById(href.slice(1))?.scrollIntoView({ behavior, block: "start" });
  }
}

export function Header() {
  const pathname = usePathname();
  const { totalCount } = useCart();
  const isConfigurator = pathname === "/products/acm-panels";

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-gray-900 focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-gray-200/60 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex w-full min-w-0 max-w-[100vw] flex-col items-stretch gap-4 px-4 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between lg:gap-5 lg:px-10 lg:py-6">
          <Link
            href="/"
            className="relative flex shrink-0 items-center justify-center rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white lg:justify-start"
            aria-label="All Cladding Solutions home"
          >
            <Image
              src="/logo.png"
              alt="All Cladding Solutions"
              width={840}
              height={216}
              className="h-[5.25rem] w-auto object-contain object-left sm:h-24 md:h-[6.5rem] lg:h-28 xl:h-32"
              priority
              unoptimized
            />
          </Link>

          {isConfigurator ? (
            <nav
              className="hidden min-w-0 flex-1 flex-wrap items-center justify-center gap-x-2 gap-y-2 md:flex md:gap-x-2 lg:gap-x-3"
              aria-label="Configurator sections"
            >
              {CONFIGURATOR_LINKS.map(({ href, label }) =>
                href.startsWith("#") ? (
                  <a
                    key={href}
                    href={href}
                    onClick={(e) => scrollToSection(e, href, "auto")}
                    className="whitespace-nowrap rounded-lg px-3 py-2.5 text-base font-bold tracking-wide text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-inset md:px-4 md:py-3 md:text-lg lg:text-lg xl:text-xl"
                  >
                    {label}
                  </a>
                ) : (
                  <Link
                    key={href}
                    href={href}
                    className="whitespace-nowrap rounded-lg px-3 py-2.5 text-base font-bold tracking-wide text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-inset md:px-4 md:py-3 md:text-lg lg:text-lg xl:text-xl"
                    aria-label={`Cart: ${totalCount} item${totalCount !== 1 ? "s" : ""}`}
                  >
                    {label}
                  </Link>
                )
              )}
            </nav>
          ) : (
            <nav
              className="hidden min-w-0 flex-1 flex-wrap items-center justify-center gap-x-2 gap-y-2 md:flex md:gap-x-2 lg:gap-x-3"
              aria-label="Main"
            >
              {NAV_LINKS.map(({ id, href, label }) => (
                <Link
                  key={id}
                  href={href}
                  className={`whitespace-nowrap rounded-lg px-3 py-2.5 text-base font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-inset md:px-4 md:py-3 md:text-lg lg:text-lg xl:text-xl ${
                    pathname === href
                      ? "text-gray-900"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          )}

          <div className="flex shrink-0 items-center justify-center gap-4 md:hidden">
            <Link
              href="/cart"
              className="whitespace-nowrap rounded-lg px-4 py-2.5 text-base font-bold tracking-wide text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-inset"
              aria-label={`Cart: ${totalCount} item${totalCount !== 1 ? "s" : ""}`}
            >
              Cart
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
