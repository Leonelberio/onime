/**
 * Crée (ou met à jour le mot de passe de) un compte super-admin.
 *   npm run superadmin:create -- admin@exemple.com 'mot-de-passe-solide'
 * L'email DOIT figurer dans SUPERADMIN_EMAILS pour obtenir l'accès /superadmin.
 */
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const [emailArg, password] = process.argv.slice(2);
const email = emailArg?.trim().toLowerCase();
if (!email || !password || password.length < 10) {
  console.error("Usage : npm run superadmin:create -- <email> <mot-de-passe (10+ caractères)>");
  process.exit(1);
}
const allowed = (process.env.SUPERADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());
if (!allowed.includes(email)) console.warn(`⚠ ${email} n'est pas dans SUPERADMIN_EMAILS : le compte sera créé mais sans accès /superadmin.`);

const db = new PrismaClient();
const passwordHash = await hashPassword(password);
await db.user.upsert({
  where: { email },
  update: { passwordHash, disabled: false },
  create: { email, name: "Super Admin", passwordHash, role: "SUPERADMIN" },
});
console.log(`✓ Compte super-admin prêt : ${email}`);
await db.$disconnect();
