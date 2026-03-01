"use client";

import { useCallback, useEffect, useState } from "react";

interface QuoteRecord {
  at: string;
  config: {
    widthLabel: string;
    lengthIn: number;
    totalSqFt: number;
    estimatedTotal: number;
    quantity: number;
    colorName: string;
    colorCode: string;
  };
  fullName: string;
  company: string;
  email: string;
  phone: string;
  projectCity: string;
  projectState: string;
  notes: string;
  uploadedFilenames?: string[];
}

function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US");
  } catch {
    return iso;
  }
}

export default function AdminQuotesPage() {
  const [password, setPassword] = useState("");
  const [storedPassword, setStoredPassword] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("admin-quotes-password");
    if (stored) setStoredPassword(stored);
  }, []);

  const fetchQuotes = useCallback(async (pwd: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/quotes", {
        headers: { "X-Admin-Password": pwd },
      });
      if (res.status === 401) {
        setError("Invalid password.");
        setQuotes([]);
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to load quotes.");
      }
      const data = (await res.json()) as { quotes: QuoteRecord[] };
      setQuotes(data.quotes);
      setStoredPassword(pwd);
      sessionStorage.setItem("admin-quotes-password", pwd);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (storedPassword) {
      fetchQuotes(storedPassword);
    }
  }, [storedPassword, fetchQuotes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) fetchQuotes(password.trim());
  };

  const handleLogout = () => {
    setStoredPassword(null);
    setPassword("");
    setQuotes([]);
    setError(null);
    sessionStorage.removeItem("admin-quotes-password");
  };

  if (!storedPassword) {
    return (
      <div className="mx-auto max-w-sm px-4 py-12">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Admin: Quote Requests</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-xs text-gray-600 mb-1">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              placeholder="Admin password"
              autoComplete="current-password"
            />
          </label>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-60"
          >
            {loading ? "Checking…" : "View quotes"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quote Requests</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Log out
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : quotes.length === 0 ? (
        <p className="text-sm text-gray-500">No quote requests yet.</p>
      ) : (
        <ul className="space-y-4">
          {quotes.map((q, i) => (
            <li
              key={`${q.at}-${i}`}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                <p className="font-medium text-gray-900">{q.fullName}</p>
                <p className="text-xs text-gray-500">{formatDate(q.at)}</p>
              </div>
              <dl className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-gray-500">Email</dt>
                  <dd>
                    <a
                      href={`mailto:${q.email}`}
                      className="text-gray-900 underline hover:no-underline"
                    >
                      {q.email}
                    </a>
                  </dd>
                </div>
                {q.company && (
                  <div>
                    <dt className="text-gray-500">Company</dt>
                    <dd className="text-gray-900">{q.company}</dd>
                  </div>
                )}
                {q.phone && (
                  <div>
                    <dt className="text-gray-500">Phone</dt>
                    <dd className="text-gray-900">{q.phone}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-gray-500">Config</dt>
                  <dd className="text-gray-900">
                    {q.config?.widthLabel ?? "—"} × {q.config?.lengthIn ?? "—"} in ·{" "}
                    {q.config?.quantity ?? "—"} panels · {q.config?.totalSqFt?.toFixed(1) ?? "—"} ft²
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Color</dt>
                  <dd className="text-gray-900">
                    {q.config?.colorName ?? "—"} ({q.config?.colorCode ?? "—"})
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Estimated total</dt>
                  <dd className="font-medium text-gray-900">
                    {q.config?.estimatedTotal != null
                      ? formatUSD(q.config.estimatedTotal)
                      : "—"}
                  </dd>
                </div>
                {(q.projectCity || q.projectState) && (
                  <div>
                    <dt className="text-gray-500">Location</dt>
                    <dd className="text-gray-900">
                      {[q.projectCity, q.projectState].filter(Boolean).join(", ")}
                    </dd>
                  </div>
                )}
                {q.uploadedFilenames?.length ? (
                  <div className="sm:col-span-2">
                    <dt className="text-gray-500">Attachments</dt>
                    <dd className="text-gray-900">{q.uploadedFilenames.join(", ")}</dd>
                  </div>
                ) : null}
                {q.notes && (
                  <div className="sm:col-span-2">
                    <dt className="text-gray-500">Notes</dt>
                    <dd className="text-gray-900">{q.notes}</dd>
                  </div>
                )}
              </dl>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
