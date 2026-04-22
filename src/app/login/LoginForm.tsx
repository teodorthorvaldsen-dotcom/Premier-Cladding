"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/portal") || raw.startsWith("//")) {
    return "/portal";
  }
  return raw;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setPending(true);
      try {
        const res = await fetch("/api/portal/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          setError(typeof data.error === "string" ? data.error : "Sign-in failed.");
          return;
        }
        router.push(nextPath);
        router.refresh();
      } catch {
        setError("Something went wrong. Try again.");
      } finally {
        setPending(false);
      }
    },
    [email, password, nextPath, router]
  );

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Staff sign in</h1>
      <p className="mt-2 text-sm text-gray-600">
        Subcontractor and admin access only. Customers are not given portal accounts; quote updates are sent by email.
      </p>

      <form onSubmit={(ev) => void onSubmit(ev)} className="mt-8 space-y-5">
        {error ? (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {error}
          </div>
        ) : null}
        <label className="block">
          <span className="block text-sm font-medium text-gray-900">Email</span>
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-gray-900">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-gray-900 px-4 py-3 text-[15px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600">
        <Link href="/" className="font-medium text-gray-900 underline-offset-2 hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}
