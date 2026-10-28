import { PrismaClient } from "@prisma/client";

const slug = process.argv[2] ?? "mon-resto";
const db = new PrismaClient();
const r = await db.Company.findUnique({
  where: { slug },
  include: {
    categories: {
      orderBy: { position: "asc" },
      include: { items: { orderBy: { position: "asc" } } },
    },
  },
});
if (!r) {
  console.error("Not found:", slug);
  process.exit(1);
}
for (const c of r.categories) {
  console.log("\n#", c.name);
  for (const i of c.items) {
    console.log(`- ${i.id} | ${i.name} | image: ${i.imageUrl ?? "(none)"}`);
  }
}
await db.$disconnect();
