import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

for (const lockfile of ["package-lock.json", "yarn.lock"]) {
  const lockPath = path.join(root, lockfile);
  try {
    fs.unlinkSync(lockPath);
  } catch (err) {
    if (err && err.code !== "ENOENT") throw err;
  }
}

const ua = process.env.npm_config_user_agent ?? "";
const execPath = process.env.npm_execpath ?? "";
const isPnpm = ua.includes("pnpm") || execPath.includes("pnpm");

if (!isPnpm) {
  console.error("Use pnpm instead");
  process.exit(1);
}
