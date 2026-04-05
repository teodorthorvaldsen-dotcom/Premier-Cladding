"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "@/context/CartContext";
import { Footer } from "./Footer";
import { Header } from "./Header";

const EMPLOYEE_ACM_TOOL_PATH = "/products/acm-panels";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const minimalChrome = pathname === EMPLOYEE_ACM_TOOL_PATH;

  return (
    <CartProvider>
      {minimalChrome ? null : <Header />}
      <main
        id="main-content"
        className={
          minimalChrome
            ? "min-h-dvh py-4 sm:py-6"
            : "min-h-[calc(100dvh-5.5rem)] py-8 sm:py-10 md:min-h-[calc(100dvh-7rem)] md:py-20 lg:py-24"
        }
      >
        {children}
      </main>
      {minimalChrome ? null : <Footer />}
    </CartProvider>
  );
}
