"use client";

import { useEffect, useMemo, useState } from "react";

type Assignee = {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
};

type Order = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  company_name: string | null;
  order_title: string;
  order_details: string;
  order_status: string;
  admin_notes: string | null;
  assigned_to: string | null;
  created_at: string;
  assignee?: Assignee | null;
};

type Subcontractor = {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  company_name?: string | null;
};

const statuses = [
  "submitted",
  "in_review",
  "approved",
  "in_production",
  "completed",
  "cancelled",
];

export default function PortalOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState("customer");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const isManager = useMemo(() => ["admin", "subcontractor"].includes(currentRole), [currentRole]);

  async function loadData() {
    setLoading(true);
    setMessage("");

    const orderRes = await fetch("/api/orders");
    const orderData = (await orderRes.json().catch(() => ({}))) as { orders?: Order[]; currentRole?: string };

    setOrders(orderData.orders || []);
    setCurrentRole(orderData.currentRole || "customer");

    if (["admin", "subcontractor"].includes(orderData.currentRole || "")) {
      const subRes = await fetch("/api/subcontractors");
      const subData = (await subRes.json().catch(() => ({}))) as { subcontractors?: Subcontractor[] };
      setSubcontractors(subData.subcontractors || []);
    } else {
      setSubcontractors([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleUpdate(
    orderId: string,
    orderStatus: string,
    assignedTo: string | null,
    adminNotes: string,
    sendCustomerEmail: boolean
  ) {
    setSavingId(orderId);
    setMessage("");

    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        orderStatus,
        assignedTo,
        adminNotes,
        sendCustomerEmail,
      }),
    });

    const data = (await res.json().catch(() => ({}))) as { error?: string; statusEmailSent?: boolean };
    setSavingId(null);

    if (!res.ok) {
      setMessage(data.error || "Failed to update order");
      return;
    }

    setMessage(data.statusEmailSent ? "Order updated and status email sent." : "Order updated.");

    await loadData();
  }

  if (loading) {
    return <div className="rounded-2xl border p-5">Loading orders...</div>;
  }

  return (
    <div className="rounded-2xl border p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold">{isManager ? "Admin Dashboard" : "My Orders"}</h2>
      </div>

      {message && <p className="text-sm mb-4">{message}</p>}

      <div className="space-y-4">
        {orders.length === 0 && <p>No orders yet.</p>}

        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            isManager={isManager}
            subcontractors={subcontractors}
            saving={savingId === order.id}
            onSave={handleUpdate}
          />
        ))}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  isManager,
  subcontractors,
  saving,
  onSave,
}: {
  order: Order;
  isManager: boolean;
  subcontractors: Subcontractor[];
  saving: boolean;
  onSave: (
    orderId: string,
    orderStatus: string,
    assignedTo: string | null,
    adminNotes: string,
    sendCustomerEmail: boolean
  ) => Promise<void>;
}) {
  const [status, setStatus] = useState(order.order_status);
  const [assignedTo, setAssignedTo] = useState<string>(order.assigned_to || "");
  const [adminNotes, setAdminNotes] = useState(order.admin_notes || "");
  const [sendEmail, setSendEmail] = useState(true);

  return (
    <div className="border rounded-2xl p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">{order.order_title}</h3>
        <span className="text-sm border rounded-full px-3 py-1">{order.order_status}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-3 text-sm">
        <p>
          <strong>Customer:</strong> {order.customer_name}
        </p>
        <p>
          <strong>Email:</strong> {order.customer_email}
        </p>
        <p>
          <strong>Phone:</strong> {order.customer_phone || "-"}
        </p>
        <p>
          <strong>Company:</strong> {order.company_name || "-"}
        </p>
        <p>
          <strong>Assigned To:</strong> {order.assignee?.full_name || order.assignee?.email || "-"}
        </p>
        <p>
          <strong>Created:</strong> {new Date(order.created_at).toLocaleString()}
        </p>
      </div>

      <div>
        <p className="text-sm font-medium mb-1">Order Details</p>
        <div className="text-sm whitespace-pre-wrap rounded-xl bg-gray-50 p-3 border">{order.order_details}</div>
      </div>

      {isManager ? (
        <div className="border-t pt-4 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1">Status</label>
              <select
                className="w-full border rounded-xl px-4 py-3"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {formatStatus(s)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Assign to subcontractor</label>
              <select
                className="w-full border rounded-xl px-4 py-3"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                <option value="">Unassigned</option>
                {subcontractors.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.full_name || sub.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Admin Notes</label>
            <textarea
              className="w-full border rounded-xl px-4 py-3 min-h-[110px]"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Optional note to include in customer update email"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
            Send customer status update email
          </label>

          <button
            type="button"
            disabled={saving}
            className="bg-black text-white rounded-xl px-4 py-3"
            onClick={() => onSave(order.id, status, assignedTo || null, adminNotes, sendEmail)}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function formatStatus(status: string) {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

