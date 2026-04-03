import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { demoUsers, type Role } from "./demoData";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export type SessionUser = {
  id: string;
  email: string;
  role: Role;
  name: string;
  customerId?: string;
};

export function signToken(user: SessionUser) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
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
