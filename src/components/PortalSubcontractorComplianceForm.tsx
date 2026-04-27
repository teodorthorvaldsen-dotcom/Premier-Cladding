"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type OrderSummary = { id: string; companyName: string };

type ComplianceFileRow = {
  slot: "generalLiability" | "workersComp" | "businessLicense";
  originalName: string;
  expiry?: string;
};

type ComplianceSubmission = {
  id: string;
  orderId: string;
  companyName: string;
  subcontractorEmail: string;
  submittedAt: string;
  files: ComplianceFileRow[];
};

const SLOT_LABEL: Record<ComplianceFileRow["slot"], string> = {
  generalLiability: "General liability",
  workersComp: "Workers comp",
  businessLicense: "Business license",
};

type Props = { orderSummaries: OrderSummary[] };

export default function PortalSubcontractorComplianceForm({ orderSummaries }: Props) {
  const [orderId, setOrderId] = useState(orderSummaries[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submissions, setSubmissions] = useState<ComplianceSubmission[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");

  const loadSubmissions = useCallback(async () => {
    setListError("");
    setListLoading(true);
    try {
      const res = await fetch("/api/portal/compliance", { credentials: "include" });
      const data = (await res.json().catch(() => ({}))) as {
        submissions?: ComplianceSubmission[];
        error?: string;
      };
      if (!res.ok) {
        setListError(typeof data.error === "string" ? data.error : "Could not load uploads.");
        setSubmissions([]);
        return;
      }
      setSubmissions(Array.isArray(data.submissions) ? data.submissions : []);
    } catch {
      setListError("Could not load uploads.");
      setSubmissions([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSubmissions();
  }, [loadSubmissions]);

  useEffect(() => {
    if (orderSummaries.length > 0 && !orderSummaries.some((o) => o.id === orderId)) {
      setOrderId(orderSummaries[0]?.id ?? "");
    }
  }, [orderSummaries, orderId]);

  const byCompany = useMemo(() => {
    const map = new Map<string, ComplianceSubmission[]>();
    for (const s of submissions) {
      const key = s.companyName.trim() || "—";
      const list = map.get(key) ?? [];
      list.push(s);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [submissions]);

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
        credentials: "include",
        body: fd,
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Upload failed.");
        return;
      }
      setSuccess(true);
      form.reset();
      await loadSubmissions();
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

  if (orderSummaries.length === 0) {
    return (
      <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        No orders are available yet. Upload compliance documents here once orders appear in the Orders tab.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-gray-200/80 bg-gray-50/50 p-6 md:p-8">
        <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-500">
          Insurance &amp; business license
        </h2>
        <p className="mt-2 text-[14px] text-gray-600">
          Staff (subcontractors and admins): upload PDF certificates for the selected order. General liability and workers
          comp each require an expiration date. Each submission is stored and listed below by customer company name.
        </p>

        {orderSummaries.length > 1 ? (
          <label className="mt-6 block max-w-md">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Order</span>
            <select
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              {orderSummaries.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id}
                  {o.companyName ? ` — ${o.companyName}` : ""}
                </option>
              ))}
            </select>
          </label>
        ) : null}

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
              Documents saved. Download anytime from the list below.
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

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-500">Stored PDFs</h2>
        <p className="mt-2 text-sm text-gray-600">
          Downloads are grouped by customer company. Each row is one submission (three PDFs). Submit again anytime to add
          another set.
        </p>

        {listLoading ? (
          <p className="mt-6 text-sm text-gray-500">Loading…</p>
        ) : listError ? (
          <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
            {listError}
          </p>
        ) : submissions.length === 0 ? (
          <p className="mt-6 text-sm text-gray-500">No documents uploaded yet.</p>
        ) : (
          <div className="mt-8 space-y-10">
            {byCompany.map(([company, rows]) => (
              <div key={company}>
                <h3 className="border-b border-gray-200 pb-2 text-base font-semibold text-gray-900">{company}</h3>
                <ul className="mt-4 space-y-6">
                  {rows.map((sub) => (
                    <li key={sub.id} className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm text-gray-600">
                        <span className="font-medium text-gray-800">{sub.orderId}</span>
                        <time className="tabular-nums text-gray-500" dateTime={sub.submittedAt}>
                          {sub.submittedAt.slice(0, 19).replace("T", " ")}
                        </time>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Uploaded by {sub.subcontractorEmail}</p>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {sub.files.map((f) => {
                          const href = `/api/portal/compliance/download?submissionId=${encodeURIComponent(sub.id)}&slot=${encodeURIComponent(f.slot)}`;
                          const expiryNote =
                            f.expiry && (f.slot === "generalLiability" || f.slot === "workersComp")
                              ? ` · exp. ${f.expiry}`
                              : "";
                          return (
                            <li key={`${sub.id}-${f.slot}`}>
                              <a
                                href={href}
                                className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                              >
                                Download — {SLOT_LABEL[f.slot]}
                                {expiryNote ? (
                                  <span className="ml-1 font-normal text-gray-500">{expiryNote}</span>
                                ) : null}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
