export function mapBusinessCategory(category) {
  if (!category) {
    return null;
  }

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
  };
}