import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Load KEY=VALUE pairs from a .env file into process.env.
 * By default does not overwrite existing env vars.
 * Pass `override: true` to always apply file values.
 * Pass `only` to limit which keys are applied.
 */
export function loadEnvFile(filePath, { override = false, only } = {}) {
  if (!fs.existsSync(filePath)) return;

  const allowed = only ? new Set(only) : null;
  const text = fs.readFileSync(filePath, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq <= 0) continue;

    const key = line.slice(0, eq).trim();
    if (allowed && !allowed.has(key)) continue;

    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (override || process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

export function findWorkspaceRoot(startDir) {
  let dir = path.resolve(startDir);
  while (true) {
    if (fs.existsSync(path.join(dir, "pnpm-workspace.yaml"))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      return path.resolve(startDir);
    }
    dir = parent;
  }
}

/** Load workspace-root `.env` by walking up from `startDir` (or cwd). */
export function loadWorkspaceEnv(startDir = process.cwd(), options) {
  const root = findWorkspaceRoot(startDir);
  loadEnvFile(path.join(root, ".env"), options);
  return root;
}

export function dirnameFromImportMeta(importMetaUrl) {
  return path.dirname(fileURLToPath(importMetaUrl));
}
