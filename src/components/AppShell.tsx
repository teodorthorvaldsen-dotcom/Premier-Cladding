"use client";

import { CartProvider } from "@/context/CartContext";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Header />
      <main id="main-content" className="min-h-[calc(100vh-4rem)] py-12 md:py-16 lg:py-20">{children}</main>
      <Footer />
    </CartProvider>
  );
}
