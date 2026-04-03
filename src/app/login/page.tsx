"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("customer@example.com");
  const [password, setPassword] = useState("customer123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regCompany, setRegCompany] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      router.push("/portal");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegError("");
    setRegSuccess(false);
    setRegLoading(true);
    try {
      const res = await fetch("/api/portal/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          company: regCompany.trim(),
          password: regPassword,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setRegError(typeof data.error === "string" ? data.error : "Registration failed.");
        return;
      }
      setRegSuccess(true);
      setRegPassword("");
    } catch {
      setRegError("Something went wrong.");
    } finally {
      setRegLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-10 rounded-2xl border border-sky-100 bg-sky-50/70 p-6 text-[15px] text-gray-800">
        <h2 className="text-lg font-semibold text-gray-900">How to check your order</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-gray-700">
          <li>
            <strong>After you submit a quote</strong> from the cart, use the <strong>same email</strong> and the{" "}
            <strong>order portal password</strong> you set on the checkout form to sign in below.
          </li>
          <li>
            Open <strong>Order portal</strong> from the site header to see your requests and open any order for
            details.
          </li>
          <li>
            No quote yet? Use <strong>Create an account</strong> to register first, then sign in — or submit a cart
            estimate to create your login automatically.
          </li>
        </ol>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
          <p className="mt-2 text-sm text-gray-600">
            Customers see their orders; employees see all orders.
          </p>

          <form onSubmit={(ev) => void handleLogin(ev)} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="portal-email">
                Email
              </label>
              <input
                id="portal-email"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="portal-password">
                Password
              </label>
              <input
                id="portal-password"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </div>

            {error ? <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-black px-4 py-3 text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium">Demo accounts</p>
            <p className="mt-2">Customer: customer@example.com / customer123</p>
            <p>Employee: employee@example.com / employee123</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">Create an account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Register with your business email and password (8+ characters). Then sign in on the left and open{" "}
            <Link href="/portal" className="font-medium text-gray-900 underline underline-offset-2 hover:text-gray-700">
              Order portal
            </Link>{" "}
            to track orders linked to your email.
          </p>

          <form onSubmit={(ev) => void handleRegister(ev)} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Full name</span>
              <input
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                placeholder="Your name"
                autoComplete="name"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Email</span>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                placeholder="you@company.com"
                autoComplete="email"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Company (optional)</span>
              <input
                value={regCompany}
                onChange={(e) => setRegCompany(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                placeholder="Company name"
                autoComplete="organization"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Password (min 8 characters)</span>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                placeholder="Choose a password"
                autoComplete="new-password"
              />
            </label>

            {regError ? (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{regError}</div>
            ) : null}
            {regSuccess ? (
              <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-900">
                Account created. You can sign in now with this email and password.
              </div>
            ) : null}

            <button
              type="submit"
              disabled={regLoading}
              className="w-full rounded-xl border-2 border-gray-900 bg-white px-4 py-3 text-[15px] font-medium text-gray-900 transition hover:bg-gray-50 disabled:opacity-50"
            >
              {regLoading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
