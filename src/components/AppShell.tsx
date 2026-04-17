"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "@/context/CartContext";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <CartProvider>
      <Header />
      <main
        id="main-content"
        className={
          isHome
            ? "min-h-[calc(100dvh-19rem)] py-8 sm:py-10 md:min-h-[calc(100dvh-19.5rem)] md:py-20 lg:py-24"
            : "min-h-[calc(100dvh-5.5rem)] py-8 sm:py-10 md:min-h-[calc(100dvh-5.75rem)] md:py-20 lg:py-24"
        }
      >
        {children}
      </main>
      <Footer />
    </CartProvider>
  );
}
