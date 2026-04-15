"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "@/context/CartContext";
import { Footer } from "./Footer";
import { Header } from "./Header";

const STAFF_ACM_WORKSPACE_PATH = "/portal/acm-panels";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const minimalChrome = pathname === STAFF_ACM_WORKSPACE_PATH;

  return (
    <CartProvider>
      {minimalChrome ? null : <Header />}
      <main
        id="main-content"
        className={
          minimalChrome
            ? "flex h-dvh min-h-0 flex-col overflow-hidden p-0"
            : "min-h-[calc(100dvh-3.25rem)] py-8 sm:py-10 md:min-h-[calc(100dvh-3.5rem)] md:py-20 lg:py-24"
        }
      >
        {minimalChrome ? (
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        ) : (
          children
        )}
      </main>
      {minimalChrome ? null : <Footer />}
    </CartProvider>
  );
}
