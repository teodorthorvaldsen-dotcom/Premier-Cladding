"use client";

import { useEffect, useState } from "react";

export type PortalSessionUser = {
  role: string;
  name: string;
  email: string;
};

export function usePortalSession() {
  const [user, setUser] = useState<PortalSessionUser | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/portal/session", { credentials: "include" })
      .then((r) => r.json() as Promise<{ user: PortalSessionUser | null }>)
      .then((d) => {
        if (!cancelled) setUser(d.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loading = user === undefined;
  const isStaff =
    user?.role === "subcontractor" ||
    user?.role === "admin" ||
    user?.role === "employee";

  return { user: user ?? null, loading, isStaff };
}
