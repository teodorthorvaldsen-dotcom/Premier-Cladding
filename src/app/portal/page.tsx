import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrderForm from "@/components/order-form";
import PortalOrders from "@/components/portal-orders";

export default async function PortalPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role, company_name")
    .eq("id", user.id)
    .single();

  const isManager = ["admin", "subcontractor"].includes(profile?.role || "");

  return (
    <div className="min-h-screen bg-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-2xl border p-6">
          <h1 className="text-3xl font-semibold">{isManager ? "Admin Order Dashboard" : "Order Portal"}</h1>
          <p className="mt-2 text-gray-600">Welcome {profile?.full_name || user.email}</p>
          <p className="text-sm text-gray-500">Role: {profile?.role || "customer"}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <OrderForm />
          <PortalOrders />
        </div>
      </div>
    </div>
  );
}
