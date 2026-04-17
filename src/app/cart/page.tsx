"use client";

import dynamic from "next/dynamic";

const CartClient = dynamic(() => import("./cart-client"), { ssr: false });

export default function CartPage() {
  return <CartClient />;
}
