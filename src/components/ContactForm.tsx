"use client";

import { useState } from "react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, message }),
      });
      const json = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        data?: unknown;
      };

      if (response.ok && json.success === true) {
        setDone(true);
        setName("");
        setEmail("");
        setCompany("");
        setMessage("");
        return;
      }

      const msg =
        typeof json.error === "string"
          ? json.error
          : response.ok
            ? "Unexpected response from server."
            : "Failed to send message.";
      setError(msg);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <p className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[15px] text-green-900" role="status">
        Thank you — your message was sent. We will reply soon.
      </p>
    );
  }

  return (
    <form onSubmit={(ev) => void onSubmit(ev)} className="mt-8 max-w-xl space-y-4">
      {error ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </div>
      ) : null}
      <label className="block">
        <span className="block text-sm font-medium text-gray-900">Name</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        />
      </label>
      <label className="block">
        <span className="block text-sm font-medium text-gray-900">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        />
      </label>
      <label className="block">
        <span className="block text-sm font-medium text-gray-900">Company (optional)</span>
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        />
      </label>
      <label className="block">
        <span className="block text-sm font-medium text-gray-900">Message</span>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1.5 block w-full rounded-xl border border-gray-200 px-3 py-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-gray-900 px-5 py-3 text-[15px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
