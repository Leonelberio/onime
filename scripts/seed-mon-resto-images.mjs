/**
 * Alias : node scripts/seed-menu-images.mjs mon-resto
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "seed-menu-images.mjs");
const r = spawnSync(process.execPath, [script, "mon-resto", ...process.argv.slice(2)], { stdio: "inherit" });
process.exit(r.status ?? 1);
