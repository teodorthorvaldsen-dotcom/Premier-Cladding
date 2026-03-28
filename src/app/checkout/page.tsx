"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import {
  allWidths,
  colors,
  finishes,
  thicknesses,
} from "@/data/acm";
import { cartItemLineTotal, type CartItem } from "@/types/cart";

const ORDER_STEPS = [
  "We receive your order.",
  "A copy is sent to us at allcladdingsolutions@gmail.com.",
  "Email confirmation is sent to you.",
  "We check inventory and prepare your estimate.",
  "We send you the finalized cost for your signature.",
  "We order materials and ship to our shop.",
  "Panels are fabricated.",
  "Once complete, you have 5 business days to pay the final deposit.",
  "Upon receipt of payment, we ship to you.",
];

function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

function describeItem(item: CartItem): string {
  const widthLabel = item.standardId
    ? allWidths.find((w) => w.id === item.standardId)?.label ?? `${item.widthIn}"`
    : `${item.widthIn}"`;
  const sizeLabel = `${widthLabel} × ${item.heightIn} in`;
  const color = colors.find((c) => c.id === item.colorId)?.name ?? item.colorId;
  const thickness = thicknesses.find((t) => t.id === item.thicknessId)?.label ?? item.thicknessId;
  const parts = [sizeLabel, color, thickness, item.panelTypeLabel].filter(Boolean);
  return parts.join(" · ");
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"wire" | "credit">("wire");
  const [signature, setSignature] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + cartItemLineTotal(i), 0);
  const totalSqFt = items.reduce((sum, i) => sum + i.areaFt2 * i.quantity, 0);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (items.length === 0) {
        setFormError("Your cart is empty.");
        return;
      }
      const form = e.currentTarget;
      const formData = new FormData(form);
      const fullName = (formData.get("fullName") as string)?.trim() ?? "";
      const email = (formData.get("email") as string)?.trim() ?? "";
      if (!fullName || !email) {
        setFormError("Full name and email are required.");
        return;
      }
      if (!signature.trim()) {
        setFormError("Please provide your electronic signature.");
        return;
      }
      setFormError(null);
      setSubmitting(true);
      try {
        const res = await fetch("/api/quote/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map(({ id, ...rest }) => rest),
            fullName,
            company: (formData.get("company") as string) ?? "",
            email,
            phone: (formData.get("phone") as string) ?? "",
            projectCity: (formData.get("projectCity") as string) ?? "",
            projectState: (formData.get("projectState") as string) ?? "",
            notes: (formData.get("notes") as string) ?? "",
            paymentMethod,
            signature: signature.trim(),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(typeof data?.error === "string" ? data.error : "Failed to submit.");
        }
        setSubmitted(true);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setSubmitting(false);
      }
    },
    [items, paymentMethod, signature]
  );

  if (items.length === 0 && !submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">Checkout</h1>
        <p className="mt-2 text-[15px] text-gray-500">Your cart is empty.</p>
        <Link
          href="/products/acm-panels"
          className="mt-8 inline-flex rounded-xl bg-gray-900 px-6 py-4 text-[15px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          Configure panels
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Thank you.</h1>
        <p className="mt-3 text-base text-gray-600">
          We have received your request. You will receive a confirmation email shortly. We will review and send your finalized quote for signature.
        </p>
        <Link
          href="/products/acm-panels"
          className="mt-8 inline-block rounded-xl bg-gray-900 px-6 py-4 text-[15px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          Return to configurator
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">Request estimate</h1>
        <p className="mt-2 text-[15px] text-gray-500">
          Review your cart and submit your details. Final pricing will be sent after we verify inventory and prepare your quote.
        </p>
      </div>

      <section className="mb-10 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:p-8">
        <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-500">Order summary</h2>
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-700">{describeItem(item)} × {item.quantity}</span>
              <span className="tabular-nums text-gray-900">{formatUSD(cartItemLineTotal(item))}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-gray-100 pt-4 text-sm font-semibold text-gray-900">
          Subtotal: {formatUSD(subtotal)} · {totalSqFt.toFixed(1)} ft² total
        </p>
        <p className="mt-2 text-[14px] text-gray-500">
          Final cost will be confirmed in your written quote after we check inventory and prepare the estimate.
        </p>
      </section>

      <section className="mb-10 rounded-2xl border border-gray-200/80 bg-gray-50/50 p-6 md:p-8">
        <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-500">Order process</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-4 text-[14px] text-gray-700">
          {ORDER_STEPS.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="mb-10 rounded-2xl border border-gray-200/80 bg-amber-50/50 p-6 md:p-8">
        <h2 className="text-[15px] font-medium uppercase tracking-wider text-amber-800">Payment</h2>
        <p className="mt-2 text-[14px] text-gray-700">
          Once your quote is final and approved by you, a 50% deposit is required. The remainder is due upon shipping.
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="paymentMethod"
              value="wire"
              checked={paymentMethod === "wire"}
              onChange={() => setPaymentMethod("wire")}
              className="h-4 w-4 border-gray-300 text-gray-900 focus:ring-gray-400"
            />
            <span className="text-[15px] font-medium text-gray-900">Wire transfer</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="paymentMethod"
              value="credit"
              checked={paymentMethod === "credit"}
              onChange={() => setPaymentMethod("credit")}
              className="h-4 w-4 border-gray-300 text-gray-900 focus:ring-gray-400"
            />
            <span className="text-[15px] font-medium text-gray-900">Credit card (3% fee)</span>
          </label>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="border-b border-gray-100 px-6 py-5 md:px-8">
          <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-500">
            Contact &amp; project details
          </h2>
        </div>
        <div className="space-y-6 p-6 md:p-8">
          {formError && (
            <div className="rounded-xl bg-red-50/80 px-4 py-3">
              <p className="text-sm text-red-700" role="alert">{formError}</p>
            </div>
          )}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="block text-sm font-medium text-gray-900">Full name</span>
              <input type="text" name="fullName" required className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2" placeholder="Full name" />
            </label>
            <label className="block sm:col-span-2">
              <span className="block text-sm font-medium text-gray-900">Company</span>
              <input type="text" name="company" className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2" placeholder="Company" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-900">Email</span>
              <input type="email" name="email" required className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2" placeholder="email@company.com" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-900">Phone</span>
              <input type="tel" name="phone" className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2" placeholder="Phone" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-900">City</span>
              <input type="text" name="projectCity" className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2" placeholder="Project city" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-900">State</span>
              <input type="text" name="projectState" className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2" placeholder="State" />
            </label>
          </div>
          <label className="block">
            <span className="block text-sm font-medium text-gray-900">Notes</span>
            <textarea name="notes" rows={3} className="mt-1.5 block min-h-[88px] w-full rounded-xl border border-gray-200 px-3 py-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2" placeholder="Project notes or special requests" />
          </label>

          <div className="rounded-xl border border-gray-200/80 bg-gray-50/50 p-6">
            <span className="block text-sm font-medium text-gray-900">Pre-estimate agreement</span>
            <p className="mt-0.5 text-xs text-gray-500">By signing below, you agree to the terms of the ACM Panel Pre-Estimate Agreement.</p>
            <a href="/documents/All_Cladding_ACM_Panel_Pre_Estimate_Agreement.html" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-[15px] font-medium text-gray-900 underline hover:text-gray-700">
              Read the pre-estimate agreement
            </a>
            <label className="mt-4 block">
              <span className="block text-sm font-medium text-gray-900">Electronic signature</span>
              <p className="mt-0.5 text-xs text-gray-500">Type your full legal name to sign.</p>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Your full name"
                className="mt-2 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              />
            </label>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-5 md:px-8 sm:flex-row sm:justify-end">
          <Link href="/cart" className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-[15px] font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
            Back to cart
          </Link>
          <button
            type="submit"
            disabled={submitting || !signature.trim()}
            className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-4 text-[15px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Submitting…" : "Submit request"}
          </button>
        </div>
      </form>
    </div>
  );
}
