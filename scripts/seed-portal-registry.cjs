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

/** Registry rows with these emails are upgraded or removed on seed (see mergeDefaultAdmin). */
const LEGACY_ADMIN_EMAILS = new Set(
  ["allcladdingsolutions@gmail.com", "picken.cycle@gmail.com"].map((e) => e.toLowerCase())
);

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

function normEmail(e) {
  return typeof e === "string" ? e.trim().toLowerCase() : "";
}

/**
 * Ensures one canonical demo admin row. Migrates legacy admin emails in place; drops extra legacy
 * rows if the canonical admin already exists.
 * @returns {"added"|"migrated"|"removed-legacy"|false}
 */
function mergeDefaultAdmin(registry) {
  let bcrypt;
  try {
    bcrypt = require("bcryptjs");
  } catch {
    process.stderr.write("[seed-portal-registry] bcryptjs not found, skip default admin merge\n");
    return false;
  }

  const targetNorm = DEFAULT_ADMIN.email.trim().toLowerCase();
  const hasCanonical = registry.admins.some((a) => normEmail(a.email) === targetNorm);

  if (hasCanonical) {
    const before = registry.admins.length;
    registry.admins = registry.admins.filter((a) => {
      const n = normEmail(a.email);
      if (n === targetNorm) return true;
      if (LEGACY_ADMIN_EMAILS.has(n)) return false;
      return true;
    });
    return registry.admins.length < before ? "removed-legacy" : false;
  }

  const legacyIdx = registry.admins.findIndex((a) => LEGACY_ADMIN_EMAILS.has(normEmail(a.email)));
  if (legacyIdx >= 0) {
    const row = registry.admins[legacyIdx];
    row.email = DEFAULT_ADMIN.email.trim();
    row.name = DEFAULT_ADMIN.name;
    row.passwordHash = bcrypt.hashSync(DEFAULT_ADMIN.demoPassword, 10);
    registry.admins = registry.admins.filter((a, i) => {
      if (i === legacyIdx) return true;
      const n = normEmail(a.email);
      if (LEGACY_ADMIN_EMAILS.has(n)) return false;
      return true;
    });
    return "migrated";
  }

  registry.admins.push({
    id: randomUUID(),
    email: DEFAULT_ADMIN.email.trim(),
    passwordHash: bcrypt.hashSync(DEFAULT_ADMIN.demoPassword, 10),
    name: DEFAULT_ADMIN.name,
    createdAt: new Date().toISOString(),
  });
  return "added";
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
  const adminResult = mergeDefaultAdmin(registry);
  const addedSub = mergeDefaultSubcontractor(registry);
  writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  if (!existed) {
    process.stdout.write(`[seed-portal-registry] created ${registryPath}\n`);
  } else {
    process.stdout.write(`[seed-portal-registry] updated ${registryPath}\n`);
  }
  if (adminResult === "added") {
    process.stdout.write(`[seed-portal-registry] merged default admin ${DEFAULT_ADMIN.email}\n`);
  } else if (adminResult === "migrated") {
    process.stdout.write(
      `[seed-portal-registry] migrated legacy admin row → ${DEFAULT_ADMIN.email} (password reset to demo default)\n`
    );
  } else if (adminResult === "removed-legacy") {
    process.stdout.write(`[seed-portal-registry] removed legacy duplicate admin row(s); kept ${DEFAULT_ADMIN.email}\n`);
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
