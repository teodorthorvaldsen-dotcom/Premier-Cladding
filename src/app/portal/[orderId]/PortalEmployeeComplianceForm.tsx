"use client";

import { useState } from "react";

type Props = { orderId: string };

export default function PortalEmployeeComplianceForm({ orderId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("orderId", orderId);

    setLoading(true);
    try {
      const res = await fetch("/api/portal/compliance", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Upload failed.");
        return;
      }
      setSuccess(true);
      form.reset();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const fileInputClass =
    "mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[15px] text-gray-900 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-800 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2";

  const dateInputClass =
    "mt-1.5 block h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-[15px] text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2";

  return (
    <section className="mb-10 rounded-2xl border border-gray-200/80 bg-gray-50/50 p-6 md:p-8">
      <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-500">
        Insurance &amp; business license
      </h2>
      <p className="mt-2 text-[14px] text-gray-600">
        Employee only. Upload PDF certificates for this order. General liability and workers comp each require an
        expiration date.
      </p>

      <form onSubmit={(ev) => void handleSubmit(ev)} className="mt-6 space-y-8">
        <fieldset className="space-y-3 border-0 p-0">
          <legend className="text-xs font-semibold uppercase tracking-wide text-gray-700">
            General liability insurance
          </legend>
          <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
            <label className="block">
              <span className="text-xs uppercase tracking-wide text-gray-500">Certificate (PDF)</span>
              <input
                type="file"
                name="generalLiability"
                accept=".pdf,application/pdf"
                required
                className={fileInputClass}
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wide text-gray-500">Expiration date</span>
              <input type="date" name="generalLiabilityExpiry" required className={dateInputClass} />
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-3 border-0 p-0">
          <legend className="text-xs font-semibold uppercase tracking-wide text-gray-700">
            Workers comp insurance
          </legend>
          <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
            <label className="block">
              <span className="text-xs uppercase tracking-wide text-gray-500">Certificate (PDF)</span>
              <input type="file" name="workersComp" accept=".pdf,application/pdf" required className={fileInputClass} />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wide text-gray-500">Expiration date</span>
              <input type="date" name="workersCompExpiry" required className={dateInputClass} />
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-3 border-0 p-0">
          <legend className="text-xs font-semibold uppercase tracking-wide text-gray-700">Business license</legend>
          <label className="block max-w-xl">
            <span className="text-xs uppercase tracking-wide text-gray-500">License (PDF)</span>
            <input
              type="file"
              name="businessLicense"
              accept=".pdf,application/pdf"
              required
              className={fileInputClass}
            />
          </label>
        </fieldset>

        {error ? (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-900" role="status">
            Documents received. (Demo: files are validated but not stored.)
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-black px-5 py-3 text-[15px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Submitting…" : "Submit compliance documents"}
        </button>
      </form>
    </section>
  );
}
