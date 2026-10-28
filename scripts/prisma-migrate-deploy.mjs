import { execSync } from "node:child_process";

/**
 * Deploy migrations; on failure, clear a stuck empty bootstrap (no Organization yet) and retry once.
 * Handles Vercel parallel builds or P3018 leaving enum types behind on a new database.
 */
export function prismaMigrateDeploy(env) {
  if (tryMigrateDeploy(env)) return;

  console.warn("prisma migrate deploy failed — attempting one-time bootstrap recovery…");

  try {
    execSync('pnpm exec prisma migrate resolve --rolled-back "20261028120000_onime_multi_org"', {
      stdio: "inherit",
      env,
    });
  } catch {
    /* no failed row to resolve */
  }

  execSync("pnpm exec prisma db execute --file scripts/recover-incomplete-bootstrap.sql --schema prisma/schema.prisma", {
    stdio: "inherit",
    env,
  });

  if (!tryMigrateDeploy(env)) {
    process.exit(1);
  }
}

function tryMigrateDeploy(env) {
  try {
    execSync("pnpm exec prisma migrate deploy", { stdio: "inherit", env });
    return true;
  } catch {
    return false;
  }
}
