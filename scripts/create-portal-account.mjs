/**
 * Creates or appends a portal account in data/portal-accounts.json (scrypt password hash).
 *
 * Usage:
 *   node scripts/create-portal-account.mjs you@company.com "your-password" employee
 *   node scripts/create-portal-account.mjs customer@example.com "your-password" customer
 *
 * Role defaults to "employee" if omitted.
 */
import { mkdir, readFile, writeFile } from "fs/promises";
import { randomBytes, scryptSync } from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const filePath = path.join(root, "data", "portal-accounts.json");

function hashPassword(plain) {
  const salt = randomBytes(16);
  const hash = scryptSync(plain, salt, 64);
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

const [, , emailArg, passwordArg, roleArg] = process.argv;
if (!emailArg || !passwordArg) {
  console.error(
    'Usage: node scripts/create-portal-account.mjs <email> <password> [customer|employee]\nExample: node scripts/create-portal-account.mjs admin@example.com "SecurePass123" employee'
  );
  process.exit(1);
}

const email = String(emailArg).trim().toLowerCase();
const role = roleArg === "customer" ? "customer" : "employee";

let data = { accounts: [] };
try {
  const raw = await readFile(filePath, "utf8");
  data = JSON.parse(raw);
} catch {
  /* new file */
}
if (!Array.isArray(data.accounts)) data.accounts = [];

if (data.accounts.some((a) => a.email === email)) {
  console.error("Error: an account with this email already exists.");
  process.exit(1);
}

data.accounts.push({
  email,
  passwordHash: hashPassword(passwordArg),
  role,
});

await mkdir(path.dirname(filePath), { recursive: true });
await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
console.log("Saved:", email, `(${role})`);
