import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  companyName: z.string().optional().default(""),
  role: z.enum(["customer", "subcontractor"]),
});

export const orderSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional().default(""),
  companyName: z.string().optional().default(""),
  orderTitle: z.string().min(2),
  orderDetails: z.string().min(5),
});

export const orderUpdateSchema = z.object({
  orderId: z.string().uuid(),
  orderStatus: z.enum([
    "submitted",
    "in_review",
    "approved",
    "in_production",
    "completed",
    "cancelled",
  ]),
  assignedTo: z.string().uuid().nullable().optional(),
  adminNotes: z.string().optional().default(""),
  sendCustomerEmail: z.boolean().optional().default(true),
});

