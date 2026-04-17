"use client";

import { useState } from "react";

export default function OrderForm() {
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    companyName: "",
    orderTitle: "",
    orderDetails: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setMessage((data as { error?: string }).error || "Failed to place order");
      return;
    }

    setMessage("Order submitted successfully. Confirmation emails were sent to the customer and admin.");

    setForm({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      companyName: "",
      orderTitle: "",
      orderDetails: "",
    });
  }

  return (
    <form onSubmit={(ev) => void handleSubmit(ev)} className="rounded-2xl border p-5 space-y-4">
      <h2 className="text-xl font-semibold">Place New Order</h2>

      <input
        className="w-full border rounded-xl px-4 py-3"
        placeholder="Customer name"
        value={form.customerName}
        onChange={(e) => setForm((s) => ({ ...s, customerName: e.target.value }))}
      />
      <input
        className="w-full border rounded-xl px-4 py-3"
        placeholder="Customer email"
        type="email"
        value={form.customerEmail}
        onChange={(e) => setForm((s) => ({ ...s, customerEmail: e.target.value }))}
      />
      <input
        className="w-full border rounded-xl px-4 py-3"
        placeholder="Customer phone"
        value={form.customerPhone}
        onChange={(e) => setForm((s) => ({ ...s, customerPhone: e.target.value }))}
      />
      <input
        className="w-full border rounded-xl px-4 py-3"
        placeholder="Company name"
        value={form.companyName}
        onChange={(e) => setForm((s) => ({ ...s, companyName: e.target.value }))}
      />
      <input
        className="w-full border rounded-xl px-4 py-3"
        placeholder="Order title"
        value={form.orderTitle}
        onChange={(e) => setForm((s) => ({ ...s, orderTitle: e.target.value }))}
      />
      <textarea
        className="w-full border rounded-xl px-4 py-3 min-h-[140px]"
        placeholder="Order details"
        value={form.orderDetails}
        onChange={(e) => setForm((s) => ({ ...s, orderDetails: e.target.value }))}
      />

      <button type="submit" disabled={loading} className="bg-black text-white rounded-xl px-4 py-3">
        {loading ? "Submitting..." : "Submit Order"}
      </button>

      {message && <p className="text-sm">{message}</p>}
    </form>
  );
}

