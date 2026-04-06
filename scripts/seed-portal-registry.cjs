/**
 * Ensures data/portal-registry.json exists and contains bcrypt-hashed demo
 * customer + employee + admin. Safe to run multiple times (won't overwrite
 * existing accounts, but will add missing seed accounts).
 *
 * Same credentials as the login page:
 * - customer@example.com / customer123
 * - employee@example.com / employee123
 * - admin@example.com / admin12345
 */
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const root = path.join(__dirname, "..");
const dataDir = path.join(root, "data");
const outPath = path.join(dataDir, "portal-registry.json");

fs.mkdirSync(dataDir, { recursive: true });

let payload = { customers: [], employees: [], admins: [] };
if (fs.existsSync(outPath)) {
  try {
    const raw = fs.readFileSync(outPath, "utf8");
    const parsed = JSON.parse(raw);
    payload = {
      customers: Array.isArray(parsed.customers) ? parsed.customers : [],
      employees: Array.isArray(parsed.employees) ? parsed.employees : [],
      admins: Array.isArray(parsed.admins) ? parsed.admins : [],
    };
  } catch {
    // fall back to empty payload; we'll rewrite the file
  }
}

const now = new Date().toISOString();
if (!payload.customers.some((c) => (c.email || "").toLowerCase() === "customer@example.com")) {
  payload.customers.push({
    id: "seed-demo-customer",
    customerId: "c1",
    email: "customer@example.com",
    passwordHash: bcrypt.hashSync("customer123", 10),
    name: "Lauren Customer",
    company: "Summit Facade Group LLC",
    createdAt: now,
  });
}
if (!payload.employees.some((e) => (e.email || "").toLowerCase() === "employee@example.com")) {
  payload.employees.push({
    id: "seed-demo-employee",
    email: "employee@example.com",
    passwordHash: bcrypt.hashSync("employee123", 10),
    name: "Alex Employee",
    createdAt: now,
  });
}
if (!payload.admins.some((a) => (a.email || "").toLowerCase() === "admin@example.com")) {
  payload.admins.push({
    id: "seed-demo-admin",
    email: "admin@example.com",
    passwordHash: bcrypt.hashSync("admin12345", 10),
    name: "Admin",
    createdAt: now,
  });
}

fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf8");
console.log("[seed-portal-registry] wrote", path.relative(root, outPath));
