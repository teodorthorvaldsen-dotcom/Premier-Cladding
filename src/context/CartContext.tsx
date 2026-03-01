"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem } from "@/types/cart";

const STORAGE_KEY = "acm-cart";

function loadFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is CartItem =>
        x != null &&
        typeof x === "object" &&
        typeof x.id === "string" &&
        typeof x.widthIn === "number" &&
        typeof x.heightIn === "number" &&
        typeof x.quantity === "number" &&
        typeof x.unitPrice === "number" &&
        typeof x.areaFt2 === "number"
    );
  } catch {
    return [];
  }
}

function saveToStorage(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  totalCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function generateId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(items);
  }, [hydrated, items]);

  const addItem = useCallback((item: Omit<CartItem, "id">) => {
    setItems((prev) => [...prev, { ...item, id: generateId() }]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    const qty = Math.max(1, Math.floor(quantity));
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
    );
  }, []);

  const totalCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({ items, addItem, removeItem, updateQuantity, totalCount }),
    [items, addItem, removeItem, updateQuantity, totalCount]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
