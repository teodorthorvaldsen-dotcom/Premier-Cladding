import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { PortalRole } from "@/types/portal";

export const PORTAL_SESSION_COOKIE = "portal_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

export type SessionUser = {
  email: string;
  role: PortalRole;
};

type TokenPayload = {
  email: string;
  role: PortalRole;
  exp: number;
};

function getSecret(): string {
  const s = process.env.PORTAL_SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("PORTAL_SESSION_SECRET must be set to at least 16 characters.");
  }
  return s;
}

function sign(body: string): string {
  return createHmac("sha256", getSecret()).update(body).digest("base64url");
}

export function createSessionToken(user: SessionUser): string {
  const exp = Date.now() + MAX_AGE_SEC * 1000;
  const inner: TokenPayload = { email: user.email, role: user.role, exp };
  const body = Buffer.from(JSON.stringify(inner), "utf8").toString("base64url");
  const sig = sign(body);
  return `${body}.${sig}`;
}

export function parseSessionToken(token: string | undefined): SessionUser | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  let expected: string;
  try {
    expected = sign(body);
  } catch {
    return null;
  }
  try {
    if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return null;
    }
  } catch {
    return null;
  }
  let parsed: TokenPayload;
  try {
    parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as TokenPayload;
  } catch {
    return null;
  }
  if (
    typeof parsed.email !== "string" ||
    (parsed.role !== "customer" && parsed.role !== "employee") ||
    typeof parsed.exp !== "number"
  ) {
    return null;
  }
  if (parsed.exp < Date.now()) return null;
  return { email: parsed.email, role: parsed.role };
}

export async function getSessionFromCookies(): Promise<SessionUser | null> {
  try {
    const jar = await cookies();
    const token = jar.get(PORTAL_SESSION_COOKIE)?.value;
    return parseSessionToken(token);
  } catch {
    return null;
  }
}

export function sessionCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  maxAge: number;
  path: string;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SEC,
    path: "/",
  };
}
