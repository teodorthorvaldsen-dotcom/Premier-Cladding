import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { timingSafeEqual } from "crypto";
import type { PortalRole } from "@/types/portal";
import { hashPassword, sha256Hex, verifyPassword } from "./password";

export const PORTAL_ACCOUNTS_PATH = path.join(process.cwd(), "data", "portal-accounts.json");

type AccountRecord = {
  email: string;
  passwordHash: string;
  role: PortalRole;
};

type AccountsFile = {
  accounts: AccountRecord[];
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function readAccountsFile(): Promise<AccountsFile> {
  try {
    const raw = await readFile(PORTAL_ACCOUNTS_PATH, "utf8");
    const parsed = JSON.parse(raw) as AccountsFile;
    if (!parsed || !Array.isArray(parsed.accounts)) return { accounts: [] };
    return parsed;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return { accounts: [] };
    throw e;
  }
}

async function writeAccountsFile(data: AccountsFile): Promise<void> {
  await mkdir(path.dirname(PORTAL_ACCOUNTS_PATH), { recursive: true });
  await writeFile(PORTAL_ACCOUNTS_PATH, JSON.stringify(data, null, 2), "utf8");
}

export async function findAccountByEmail(email: string): Promise<AccountRecord | null> {
  const norm = normalizeEmail(email);
  const { accounts } = await readAccountsFile();
  return accounts.find((a) => normalizeEmail(a.email) === norm) ?? null;
}

export async function registerCustomer(email: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const norm = normalizeEmail(email);
  if (!norm.includes("@")) return { ok: false, error: "Invalid email." };
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };

  const { accounts } = await readAccountsFile();
  if (accounts.some((a) => normalizeEmail(a.email) === norm)) {
    return { ok: false, error: "An account with this email already exists." };
  }

  accounts.push({
    email: norm,
    passwordHash: hashPassword(password),
    role: "customer",
  });
  await writeAccountsFile({ accounts });
  return { ok: true };
}

export async function validateCredentials(
  email: string,
  password: string
): Promise<{ user: { email: string; role: PortalRole } } | { error: string }> {
  const norm = normalizeEmail(email);
  if (!norm || !password) return { error: "Email and password are required." };

  const staffEmail = process.env.PORTAL_STAFF_EMAIL?.trim().toLowerCase();
  const staffPass = process.env.PORTAL_STAFF_PASSWORD ?? "";
  const staffHash = process.env.PORTAL_STAFF_PASSWORD_SHA256?.trim().toLowerCase();

  if (staffEmail && norm === staffEmail && staffPass) {
    const matchPlain = timingSafeEqualString(password, staffPass);
    const matchHash = staffHash && sha256Hex(password).toLowerCase() === staffHash;
    if (matchPlain || matchHash) {
      return { user: { email: norm, role: "employee" } };
    }
  }

  const account = await findAccountByEmail(norm);
  if (!account) return { error: "Invalid email or password." };
  if (!verifyPassword(password, account.passwordHash)) return { error: "Invalid email or password." };

  return { user: { email: account.email, role: account.role } };
}

function timingSafeEqualString(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, "utf8");
    const bb = Buffer.from(b, "utf8");
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}
