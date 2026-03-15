"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

const NAV_LINKS = [
  { href: "/products/acm-panels", label: "ACM Panels" },
  { href: "/custom-shop-drawings", label: "Custom Shop Drawings" },
  { href: "/projects", label: "Our Work" },
  { href: "/about", label: "About" },
  { href: "/consultation", label: "Consultation" },
  { href: "/contact", label: "Contact" },
] as const;

const CONFIGURATOR_LINKS = [
  { href: "#size", label: "Size" },
  { href: "#thickness", label: "Thickness" },
  { href: "#color", label: "Finish" },
  { href: "#color", label: "Color" },
  { href: "#quantity", label: "Quantity" },
  { href: "#estimate", label: "Estimate" },
] as const;

function scrollToEstimate(e: React.MouseEvent) {
  e.preventDefault();
  document.getElementById("estimate")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function scrollToSection(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  if (href.startsWith("#")) {
    e.preventDefault();
    document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
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
        <div className="flex min-h-[200px] w-full items-center justify-between gap-4 pl-4 pr-4 sm:pl-6 sm:pr-6 sm:gap-6 lg:min-h-[260px] lg:pl-8 lg:pr-8">
          <Link
            href="/"
            className="relative flex shrink-0 items-center rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white"
            aria-label="All Cladding Solutions home"
          >
            <Image
              src="/logo.png"
              alt="All Cladding Solutions"
              width={840}
              height={216}
              className="h-[168px] w-auto object-contain object-left sm:h-[192px] lg:h-[240px]"
              priority
              unoptimized
            />
          </Link>

          {isConfigurator ? (
            <nav
              className="hidden flex-1 items-center justify-center gap-5 md:flex lg:gap-8"
              aria-label="Configurator sections"
            >
              {CONFIGURATOR_LINKS.map(({ href, label }) => (
                <a
                  key={label}
                  href={href}
                  onClick={(e) => scrollToSection(e, href)}
                  className="whitespace-nowrap rounded-lg px-4 py-3 text-lg font-bold tracking-wide text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-inset lg:text-xl"
                >
                  {label}
                </a>
              ))}
            </nav>
          ) : (
            <nav
              className="hidden flex-1 items-center justify-center gap-5 md:flex lg:gap-8"
              aria-label="Main"
            >
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`whitespace-nowrap rounded-lg px-4 py-3 text-lg font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-inset lg:text-xl ${
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

          <div className="flex shrink-0 items-center gap-4 lg:gap-5">
            {isConfigurator ? (
              <button
                type="button"
                onClick={scrollToEstimate}
                className="whitespace-nowrap rounded-lg bg-gray-900 px-5 py-3 text-lg font-bold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white lg:px-6 lg:py-3.5 lg:text-xl"
              >
                Get an Estimate
              </button>
            ) : (
              <Link
                href="/products/acm-panels"
                className="whitespace-nowrap rounded-lg bg-gray-900 px-5 py-3 text-lg font-bold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white lg:px-6 lg:py-3.5 lg:text-xl"
              >
                Get an Estimate
              </Link>
            )}
            <Link
              href="/cart"
              className="whitespace-nowrap rounded-lg px-4 py-3 text-lg font-bold tracking-wide text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-inset lg:text-xl"
              aria-label={`Cart: ${totalCount} item${totalCount !== 1 ? "s" : ""}`}
            >
              Cart {totalCount > 0 && <span className="ml-0.5">({totalCount})</span>}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
