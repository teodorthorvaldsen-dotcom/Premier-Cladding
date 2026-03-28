"use client";

import { CartProvider } from "@/context/CartContext";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Header />
      <main
        id="main-content"
        className="min-h-[calc(100dvh-5.5rem)] py-8 sm:py-10 md:min-h-[calc(100dvh-7rem)] md:py-20 lg:py-24"
      >
        {children}
      </main>
      <Footer />
    </CartProvider>
  );
}
