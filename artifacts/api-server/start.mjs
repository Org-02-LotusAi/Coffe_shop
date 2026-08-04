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
  only: [
    "DATABASE_URL",
    "STRIPE_SECRET_KEY",
    "API_PORT",
    "NODE_ENV",
    "LOG_LEVEL",
  ],
});

if (process.env.API_PORT) {
  process.env.PORT = process.env.API_PORT;
} else if (!process.env.PORT) {
  process.env.PORT = "8080";
}

const result = spawnSync(
  process.execPath,
  ["--enable-source-maps", "./dist/index.mjs"],
  {
    stdio: "inherit",
    env: process.env,
    cwd: here,
  },
);

process.exit(result.status ?? 1);
