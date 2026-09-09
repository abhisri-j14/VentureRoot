import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function seedBusinessCategories() {
  const categories = [
    {
      name: "Agriculture",
      slug: "agriculture",
      description: "Agriculture and farming related businesses",
    },
    {
      name: "Retail",
      slug: "retail",
      description: "Retail shops and local commerce",
    },
    {
      name: "Food Processing",
      slug: "food-processing",
      description: "Food processing and production businesses",
    },
    {
      name: "Manufacturing",
      slug: "manufacturing",
      description: "Manufacturing related businesses",
    },
    {
      name: "Services",
      slug: "services",
      description: "Service based businesses",
    },
    {
      name: "Handicrafts",
      slug: "handicrafts",
      description: "Traditional handicraft businesses",
    },
    {
      name: "Dairy",
      slug: "dairy",
      description: "Dairy farming, milk production and livestock",
    },
    {
      name: "Tailoring",
      slug: "tailoring",
      description: "Garment manufacturing, tailoring and textiles",
    },
  ];

  for (const category of categories) {
    await prisma.businessCategory.upsert({
      where: {
        slug: category.slug,
      },

      update: {
        name: category.name,
        description: category.description,
        isActive: true,
      },

      create: category,
    });
  }
}

async function getOrCreateLocation({
  name,
  type,
  parentId = null,
  code = null,
}) {
  const existingLocation = await prisma.location.findFirst({
    where: {
      name,
      type,
      parentId,
    },
  });

  if (existingLocation) {
    return existingLocation;
  }

  return prisma.location.create({
    data: {
      name,
      type,
      parentId,
      code,
    },
  });
}

async function seedLocations() {
  const westBengal = await getOrCreateLocation({
    name: "West Bengal",
    type: "STATE",
    code: "WB",
  });

  const south24Parganas = await getOrCreateLocation({
    name: "South 24 Parganas",
    type: "DISTRICT",
    parentId: westBengal.id,
  });

  const diamondHarbour = await getOrCreateLocation({
    name: "Diamond Harbour",
    type: "BLOCK",
    parentId: south24Parganas.id,
  });

  await getOrCreateLocation({
    name: "Sample Village",
    type: "VILLAGE",
    parentId: diamondHarbour.id,
  });
}

async function main() {
  console.log("🌱 Database seeding started...");

  await seedBusinessCategories();
  console.log("✅ Business categories seeded");

  await seedLocations();
  console.log("✅ Locations seeded");

  console.log("🌱 Database seeding completed");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });