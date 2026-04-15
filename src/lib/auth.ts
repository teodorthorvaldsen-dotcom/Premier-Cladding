import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { demoUsers, type Role } from "./demoData";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

/** Legacy JWT payloads may still use the old role value; normalize everywhere. */
export type LegacyRole = Role | "employee";

export function normalizeSessionRole(role: LegacyRole): Role {
  return role === "employee" ? "subcontractor" : role;
}

export type SessionUser = {
  id: string;
  email: string;
  role: Role;
  name: string;
  customerId?: string;
};

export function signToken(user: SessionUser) {
  const payload: SessionUser = {
    ...user,
    role: normalizeSessionRole(user.role as LegacyRole),
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionUser & { role?: LegacyRole };
    return {
      ...decoded,
      role: normalizeSessionRole(decoded.role ?? "customer"),
    };
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("portal_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function findDemoUser(email: string, password: string) {
  return demoUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
}

/**
 * File-backed registry first (bcrypt, seeded on npm install), then plain-text demo users in demoData.
 * Registry is loaded via dynamic import so this module never pulls `fs`/bcrypt at load time
 * (avoids breaking login in Edge or when persistence isn’t available).
 */
export async function authenticatePortalUser(
  email: string,
  password: string
): Promise<SessionUser | null> {
  try {
    const { verifyRegistryPortalLogin } = await import("@/lib/portalPersistence");
    const fromRegistry = verifyRegistryPortalLogin(email, password);
    if (fromRegistry) {
      return {
        id: fromRegistry.id,
        email: fromRegistry.email,
        role: fromRegistry.role,
        name: fromRegistry.name,
        ...(fromRegistry.customerId ? { customerId: fromRegistry.customerId } : {}),
      };
    }
  } catch {
    /* persistence unavailable */
  }
  const demo = findDemoUser(email, password);
  if (demo) {
    return {
      id: demo.id,
      email: demo.email,
      role: normalizeSessionRole(demo.role as LegacyRole),
      name: demo.name,
      customerId: demo.customerId,
    };
  }
  return null;
}
