import { prisma } from "@/lib/prisma";

export async function findBusinessCategoryById(
  categoryId
) {
  return prisma.businessCategory.findUnique({
    where: {
      id: categoryId,
    },
  });
}