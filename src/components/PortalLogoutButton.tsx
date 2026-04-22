"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PortalLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => void logout()}
      className="rounded-xl bg-black px-4 py-3 text-white hover:opacity-90 disabled:opacity-50"
    >
      {loading ? "Signing out…" : "Log Out"}
    </button>
  );
}
