"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  customer_name: string;
  customer_email: string;
  company_name: string | null;
  customer_phone: string | null;
  order_title: string;
  order_details: string;
  order_status: string;
  created_at: string;
};

export default function PortalOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      const res = await fetch("/api/orders");
      const data = await res.json().catch(() => ({}));
      setOrders((data as { orders?: Order[] }).orders || []);
      setLoading(false);
    }

    void loadOrders();
  }, []);

  if (loading) return <div className="rounded-2xl border p-5">Loading orders...</div>;

  return (
    <div className="rounded-2xl border p-5">
      <h2 className="text-xl font-semibold mb-4">Orders</h2>

      <div className="space-y-4">
        {orders.length === 0 && <p>No orders yet.</p>}

        {orders.map((order) => (
          <div key={order.id} className="border rounded-2xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h3 className="font-semibold">{order.order_title}</h3>
              <span className="text-sm border rounded-full px-3 py-1">{order.order_status}</span>
            </div>

            <p className="text-sm">
              <strong>Customer:</strong> {order.customer_name}
            </p>
            <p className="text-sm">
              <strong>Email:</strong> {order.customer_email}
            </p>
            <p className="text-sm">
              <strong>Company:</strong> {order.company_name || "-"}
            </p>
            <p className="text-sm">
              <strong>Phone:</strong> {order.customer_phone || "-"}
            </p>
            <p className="text-sm mt-2 whitespace-pre-wrap">{order.order_details}</p>
            <p className="text-xs text-gray-500 mt-3">Created: {new Date(order.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

