/**
 * Creates data/portal-registry.json with bcrypt-hashed demo customer + employee
 * when the file is missing (fresh clone, CI, Vercel build).
 * Same credentials as the login page: customer@example.com / customer123,
 * employee@example.com / employee123.
 */
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const root = path.join(__dirname, "..");
const dataDir = path.join(root, "data");
const outPath = path.join(dataDir, "portal-registry.json");

if (fs.existsSync(outPath)) {
  process.exit(0);
}

fs.mkdirSync(dataDir, { recursive: true });

const payload = {
  customers: [
    {
      id: "seed-demo-customer",
      customerId: "c1",
      email: "customer@example.com",
      passwordHash: bcrypt.hashSync("customer123", 10),
      name: "Lauren Customer",
      company: "Summit Facade Group LLC",
      createdAt: new Date().toISOString(),
    },
  ],
  employees: [
    {
      id: "seed-demo-employee",
      email: "employee@example.com",
      passwordHash: bcrypt.hashSync("employee123", 10),
      name: "Alex Employee",
      createdAt: new Date().toISOString(),
    },
  ],
};

fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf8");
console.log("[seed-portal-registry] wrote", path.relative(root, outPath));
