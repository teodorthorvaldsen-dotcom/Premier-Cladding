"use client";

import { useState } from "react";

const BUSINESS_EMAIL = "info@claddingsolutions.com";
const BUSINESS_PHONE = "(555) 123-4567";
const SERVICE_AREA = "Nationwide shipping across the United States";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const body = {
      name: formData.get("name") as string,
      company: formData.get("company") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      message: formData.get("message") as string,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data?.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMessage("Failed to send. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
        Contact
      </h1>
      <p className="mt-2 text-[15px] text-gray-500">
        Reach out for quotes, technical questions, and inquiries.
      </p>

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="text-[13px] font-medium uppercase tracking-wider text-gray-500">
            Get in touch
          </h2>
          <p className="mt-4 text-[15px] text-gray-700">
            {BUSINESS_EMAIL}
          </p>
          <p className="mt-1 text-[15px] text-gray-700">
            {BUSINESS_PHONE}
          </p>
          <p className="mt-6 text-[13px] text-gray-500">
            {SERVICE_AREA}
          </p>
        </section>

        <section>
          <h2 className="text-[13px] font-medium uppercase tracking-wider text-gray-500">
            Send a message
          </h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="name" className="block text-[13px] font-medium text-gray-700">
                Name <span className="text-gray-400">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-[15px] text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>
            <div>
              <label htmlFor="company" className="block text-[13px] font-medium text-gray-700">
                Company
              </label>
              <input
                id="company"
                name="company"
                type="text"
                autoComplete="organization"
                className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-[15px] text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-[13px] font-medium text-gray-700">
                Email <span className="text-gray-400">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-[15px] text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-[13px] font-medium text-gray-700">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-[15px] text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-[13px] font-medium text-gray-700">
                Message <span className="text-gray-400">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-[15px] text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>
            {status === "success" && (
              <p className="text-[14px] text-green-700" role="alert">
                Message sent. We&apos;ll respond within 1 business day.
              </p>
            )}
            {status === "error" && errorMessage && (
              <p className="text-[14px] text-red-600" role="alert">
                {errorMessage}
              </p>
            )}
            <button
              type="submit"
              disabled={status === "submitting"}
              className="rounded-xl bg-gray-900 px-6 py-3.5 text-[15px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "submitting" ? "Sending…" : "Send message"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
