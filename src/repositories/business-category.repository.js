import { prisma } from "@/lib/prisma";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function findBusinessCategoryById(categoryId) {
  if (!categoryId || !UUID_REGEX.test(categoryId)) {
    return null;
  }
  return prisma.businessCategory.findUnique({
    where: {
      id: categoryId,
    },
  });
}

export async function findBusinessCategoryBySlugOrName(identifier) {
  if (!identifier || typeof identifier !== "string") {
    return null;
  }
  const clean = identifier.trim();
  const slug = clean.toLowerCase().replace(/\s+/g, "-");

  return prisma.businessCategory.findFirst({
    where: {
      OR: [
        { slug: { equals: slug, mode: "insensitive" } },
        { name: { equals: clean, mode: "insensitive" } },
      ],
    },
  });
}

export async function findBusinessCategoryByIdOrSlug(identifier) {
  if (!identifier) return null;
  
  if (UUID_REGEX.test(identifier)) {
    const foundById = await findBusinessCategoryById(identifier);
    if (foundById) return foundById;
  }

  return findBusinessCategoryBySlugOrName(identifier);
}

export async function createOrGetBusinessCategory({ name, slug, description = null }) {
  const existing = await findBusinessCategoryBySlugOrName(slug || name);
  if (existing) return existing;

  const formattedName = name || (slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "Enterprise");
  const formattedSlug = (slug || formattedName).toLowerCase().trim().replace(/\s+/g, "-");

  return prisma.businessCategory.create({
    data: {
      name: formattedName,
      slug: formattedSlug,
      description: description || `${formattedName} enterprise and local trade`,
      isActive: true,
    },
  });
}

export async function listActiveBusinessCategories() {
  return prisma.businessCategory.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}