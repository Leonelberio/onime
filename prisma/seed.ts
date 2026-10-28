import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";
import { trialEndFrom } from "../src/lib/subscription";

const db = new PrismaClient();

const OWNER_EMAIL = "owner@onime.demo";
const OWNER_PASSWORD = "onime-demo-2026";
const ORG_NAME = "Demo ONIME Retail";

const DEMO_EMPLOYEES = [
  { email: "aicha@onime.demo", name: "Aïcha Diallo", boutiqueSlug: "plateau" },
  { email: "fatou@onime.demo", name: "Fatou N'diaye", boutiqueSlug: "almadies" },
] as const;

const PRODUCTS = [
  { name: "T-shirt coton", sku: "TSH-COT", unitPrice: 12_000, stockQty: 40, minStock: 10 },
  { name: "Jean slim", sku: "JEAN-SLM", unitPrice: 25_000, stockQty: 22, minStock: 6 },
  { name: "Sac shopping", sku: "SAC-SHP", unitPrice: 5_000, stockQty: 60, minStock: 15 },
] as const;

async function main() {
  const now = new Date();
  const passwordHash = await hashPassword(OWNER_PASSWORD);

  const org = await db.organization.upsert({
    where: { slug: "demo-onime" },
    create: {
      slug: "demo-onime",
      name: ORG_NAME,
      trialEndsAt: trialEndFrom(now),
      staff: {
        create: {
          email: OWNER_EMAIL,
          name: "Propriétaire démo",
          passwordHash,
          role: "OWNER",
        },
      },
      boutiques: {
        create: [
          {
            slug: "plateau",
            name: "Boutique Plateau",
            workplaceLatitude: 14.6937,
            workplaceLongitude: -17.4441,
            geofenceRadiusM: 120,
          },
          {
            slug: "almadies",
            name: "Boutique Almadies",
            workplaceLatitude: 14.7397,
            workplaceLongitude: -17.5123,
            geofenceRadiusM: 120,
          },
        ],
      },
    },
    update: { name: ORG_NAME },
    include: { boutiques: true, staff: true },
  });

  const owner = org.staff.find((u) => u.email === OWNER_EMAIL);
  if (owner && !owner.organizationId) {
    await db.user.update({ where: { id: owner.id }, data: { organizationId: org.id } });
  }

  const boutiqueBySlug = Object.fromEntries(org.boutiques.map((b) => [b.slug, b]));

  for (const b of org.boutiques) {
    for (const p of PRODUCTS) {
      const sku = `${p.sku}-${b.slug}`;
      const existing = await db.product.findFirst({ where: { boutiqueId: b.id, sku } });
      if (existing) {
        await db.product.update({
          where: { id: existing.id },
          data: { unitPrice: p.unitPrice, stockQty: p.stockQty, minStock: p.minStock, active: true },
        });
      } else {
        await db.product.create({
          data: { boutiqueId: b.id, ...p, sku, name: `${p.name} (${b.slug})` },
        });
      }
    }
  }

  const empPassword = await hashPassword("demo-onime-2026");
  for (const e of DEMO_EMPLOYEES) {
    const boutique = boutiqueBySlug[e.boutiqueSlug];
    if (!boutique) continue;
    await db.user.upsert({
      where: { email: e.email },
      create: {
        email: e.email,
        name: e.name,
        passwordHash: empPassword,
        role: "EMPLOYEE",
        organizationId: org.id,
        boutiqueId: boutique.id,
      },
      update: { organizationId: org.id, boutiqueId: boutique.id, disabled: false },
    });
  }

  console.log("Seed ONIME OK");
  console.log(`  Owner: ${OWNER_EMAIL} / ${OWNER_PASSWORD}`);
  console.log(`  Employés: demo-onime-2026`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
