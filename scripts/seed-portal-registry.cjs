"use strict";

/**
 * Ensures data/portal-registry.json exists (empty registry) for deploys and local dev.
 * See src/lib/portalPersistence.ts — registrySeedPath() reads this file when no writable copy exists.
 */

const { existsSync, mkdirSync, writeFileSync } = require("fs");
const { join } = require("path");

const dataDir = join(process.cwd(), "data");
const registryPath = join(dataDir, "portal-registry.json");

const EMPTY_REGISTRY = {
  customers: [],
  employees: [],
  admins: [],
};

function main() {
  mkdirSync(dataDir, { recursive: true });
  if (!existsSync(registryPath)) {
    writeFileSync(registryPath, `${JSON.stringify(EMPTY_REGISTRY, null, 2)}\n`, "utf8");
    process.stdout.write(`[seed-portal-registry] created ${registryPath}\n`);
  } else {
    process.stdout.write(`[seed-portal-registry] already present, skip ${registryPath}\n`);
  }
}

main();
