import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const here = path.dirname(fileURLToPath(import.meta.url));
const loadEnvUrl = pathToFileURL(
  path.resolve(here, "../../scripts/load-env.mjs"),
).href;
const { loadWorkspaceEnv } = await import(loadEnvUrl);

loadWorkspaceEnv(here, {
  override: true,
  only: ["API_PORT", "NODE_ENV", "LOG_LEVEL"],
});
// Prefer Replit Secrets / existing env; .env only fills gaps (never wipes secrets).
loadWorkspaceEnv(here, {
  override: false,
  only: ["DATABASE_URL", "STRIPE_SECRET_KEY", "VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY", "SUPABASE_URL", "SUPABASE_ANON_KEY"],
});

process.env.NODE_ENV = process.env.NODE_ENV || "development";

// Prefer API_PORT so root .env can keep PORT for Vite (25197).
if (process.env.API_PORT) {
  process.env.PORT = process.env.API_PORT;
} else if (!process.env.PORT) {
  process.env.PORT = "8080";
}

const run = (script) => {
  const result = spawnSync("pnpm", ["run", script], {
    stdio: "inherit",
    shell: true,
    env: process.env,
    cwd: here,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

run("build");
run("start");
