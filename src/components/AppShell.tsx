"use client";

import { CartProvider } from "@/context/CartContext";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Header />
      <main id="main-content" className="min-h-[calc(100vh-6rem)] py-14 md:py-20 lg:py-24">{children}</main>
      <Footer />
    </CartProvider>
  );
}
