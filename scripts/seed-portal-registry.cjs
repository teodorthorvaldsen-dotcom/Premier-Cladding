"use strict";

/**
 * Ensures data/portal-registry.json exists for deploys and local dev.
 * Merges a default portal admin if missing (bcrypt hash only — no plaintext).
 * See src/lib/portalPersistence.ts — registrySeedPath() reads this when no writable copy exists.
 */

const { existsSync, mkdirSync, readFileSync, writeFileSync } = require("fs");
const { join } = require("path");
const { randomUUID } = require("crypto");

const dataDir = join(process.cwd(), "data");
const registryPath = join(dataDir, "portal-registry.json");

/** Matches demo admin portal login in src/lib/demoData.ts (plaintext demo + registry bcrypt seed). */
const DEFAULT_ADMIN = {
  email: "premiercladdingsolutions@gmail.com",
  name: "Premier Cladding",
  demoPassword: "gator825",
};

/** Staff subcontractor merged if missing (bcrypt hash written to JSON only). */
const DEFAULT_SUBCONTRACTOR = {
  email: "Subcontractor@gmail.com",
  name: "Premier Subcontractor",
};

const EMPTY_REGISTRY = {
  customers: [],
  employees: [],
  admins: [],
};

function readRegistry() {
  if (!existsSync(registryPath)) {
    return { ...EMPTY_REGISTRY };
  }
  try {
    const raw = readFileSync(registryPath, "utf8");
    const parsed = JSON.parse(raw);
    return {
      customers: Array.isArray(parsed.customers) ? parsed.customers : [],
      employees: Array.isArray(parsed.employees) ? parsed.employees : [],
      admins: Array.isArray(parsed.admins) ? parsed.admins : [],
    };
  } catch {
    return { ...EMPTY_REGISTRY };
  }
}

function mergeDefaultAdmin(registry) {
  const email = DEFAULT_ADMIN.email.trim().toLowerCase();
  if (registry.admins.some((a) => typeof a.email === "string" && a.email.trim().toLowerCase() === email)) {
    return false;
  }
  let bcrypt;
  try {
    bcrypt = require("bcryptjs");
  } catch {
    process.stderr.write("[seed-portal-registry] bcryptjs not found, skip default admin merge\n");
    return false;
  }
  registry.admins.push({
    id: randomUUID(),
    email: DEFAULT_ADMIN.email.trim(),
    passwordHash: bcrypt.hashSync(DEFAULT_ADMIN.demoPassword, 10),
    name: DEFAULT_ADMIN.name,
    createdAt: new Date().toISOString(),
  });
  return true;
}

function mergeDefaultSubcontractor(registry) {
  const emailNorm = DEFAULT_SUBCONTRACTOR.email.trim().toLowerCase();
  if (
    registry.employees.some((e) => typeof e.email === "string" && e.email.trim().toLowerCase() === emailNorm)
  ) {
    return false;
  }
  let bcrypt;
  try {
    bcrypt = require("bcryptjs");
  } catch {
    process.stderr.write("[seed-portal-registry] bcryptjs not found, skip default subcontractor merge\n");
    return false;
  }
  registry.employees.push({
    id: randomUUID(),
    email: DEFAULT_SUBCONTRACTOR.email.trim(),
    passwordHash: bcrypt.hashSync("Premiercladding", 10),
    name: DEFAULT_SUBCONTRACTOR.name,
    createdAt: new Date().toISOString(),
  });
  return true;
}

function main() {
  mkdirSync(dataDir, { recursive: true });
  const existed = existsSync(registryPath);
  const registry = existed ? readRegistry() : { ...EMPTY_REGISTRY };
  const addedAdmin = mergeDefaultAdmin(registry);
  const addedSub = mergeDefaultSubcontractor(registry);
  writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  if (!existed) {
    process.stdout.write(`[seed-portal-registry] created ${registryPath}\n`);
  } else {
    process.stdout.write(`[seed-portal-registry] updated ${registryPath}\n`);
  }
  if (addedAdmin) {
    process.stdout.write(`[seed-portal-registry] merged default admin ${DEFAULT_ADMIN.email}\n`);
  } else {
    process.stdout.write(`[seed-portal-registry] default admin already present, skip merge\n`);
  }
  if (addedSub) {
    process.stdout.write(`[seed-portal-registry] merged default subcontractor ${DEFAULT_SUBCONTRACTOR.email}\n`);
  } else {
    process.stdout.write(`[seed-portal-registry] default subcontractor already present, skip merge\n`);
  }
}

main();
