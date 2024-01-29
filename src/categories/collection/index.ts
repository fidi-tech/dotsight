import { NetworkCategory } from './network.category';

class CategoriesIdCollisionError extends Error {
  constructor(id: string) {
    super(`Two categories with the same id ${id} encountered`);
  }
}

export const categories = {
  [NetworkCategory.getId()]: NetworkCategory,
} as const;

const idCollisionMap = new Set<string>();
for (const category of Object.values(categories)) {
  const id = category.getId();
  if (idCollisionMap.has(id)) {
    throw new CategoriesIdCollisionError(id);
  }
  category.getName();
  category.getIcon();
  category.validateSubcategory('smth');
}
