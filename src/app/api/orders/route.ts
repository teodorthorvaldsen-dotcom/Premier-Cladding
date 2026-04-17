import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { orderSchema, orderUpdateSchema } from "@/lib/validations";
import { sendOrderEmails, sendStatusUpdateEmails } from "@/lib/email";

async function getProfile(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, email, full_name")
    .eq("id", userId)
    .single();

  return profile;
}

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getProfile(supabase, user.id);

  let query = supabase
    .from("orders")
    .select(
      `
      *,
      assignee:profiles!orders_assigned_to_fkey (
        id,
        full_name,
        email,
        role
      )
    `
    )
    .order("created_at", { ascending: false });

  if (profile?.role === "customer") {
    query = query.eq("created_by", user.id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    orders: data,
    currentRole: profile?.role || "customer",
  });
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = orderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { customerName, customerEmail, customerPhone, companyName, orderTitle, orderDetails } = parsed.data;

    const { data: inserted, error } = await supabase
      .from("orders")
      .insert({
        created_by: user.id,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        company_name: companyName,
        order_title: orderTitle,
        order_details: orderDetails,
        order_status: "submitted",
      })
      .select("*")
      .single();

    if (error || !inserted) {
      return NextResponse.json({ error: error?.message || "Failed to save order" }, { status: 400 });
    }

    await sendOrderEmails({
      orderId: inserted.id,
      customerName: inserted.customer_name,
      customerEmail: inserted.customer_email,
      customerPhone: inserted.customer_phone || "",
      companyName: inserted.company_name || "",
      orderTitle: inserted.order_title,
      orderDetails: inserted.order_details,
      createdAt: new Date(inserted.created_at).toLocaleString(),
    });

    return NextResponse.json({ success: true, order: inserted });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getProfile(supabase, user.id);

    if (!profile || !["admin", "subcontractor"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = orderUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { orderId, orderStatus, assignedTo, adminNotes, sendCustomerEmail } = parsed.data;

    const { data: existingOrder, error: existingError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (existingError || !existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const previousStatus = existingOrder.order_status;

    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({
        order_status: orderStatus,
        assigned_to: assignedTo ?? null,
        admin_notes: adminNotes,
        last_status_emailed_at:
          sendCustomerEmail && previousStatus !== orderStatus
            ? new Date().toISOString()
            : existingOrder.last_status_emailed_at,
      })
      .eq("id", orderId)
      .select("*")
      .single();

    if (updateError || !updatedOrder) {
      return NextResponse.json({ error: updateError?.message || "Failed to update order" }, { status: 400 });
    }

    if (sendCustomerEmail && previousStatus !== orderStatus) {
      await sendStatusUpdateEmails({
        orderId: updatedOrder.id,
        customerName: updatedOrder.customer_name,
        customerEmail: updatedOrder.customer_email,
        orderTitle: updatedOrder.order_title,
        previousStatus,
        newStatus: orderStatus,
        adminNotes,
      });
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      statusEmailSent: sendCustomerEmail && previousStatus !== orderStatus,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
