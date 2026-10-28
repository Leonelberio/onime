import { execSync } from "node:child_process";

const env = { ...process.env };

if (!env.DIRECT_URL?.trim() && env.DATABASE_URL?.trim()) {
  env.DIRECT_URL = env.DATABASE_URL;
  console.log("DIRECT_URL non défini : utilisation de DATABASE_URL pour les migrations.");
}

if (!env.DATABASE_URL?.trim()) {
  console.error("DATABASE_URL est requis sur Vercel (Settings → Environment Variables).");
  process.exit(1);
}

function run(cmd) {
  execSync(cmd, { stdio: "inherit", env });
}

run("pnpm exec prisma migrate deploy");
run("pnpm exec prisma generate");
run("pnpm exec next build");
