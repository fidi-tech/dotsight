import { NetworkCategory } from './network.category';

export const categories = {
  [NetworkCategory.getId()]: NetworkCategory,
} as const;

for (const category of Object.values(categories)) {
  category.getId();
  category.getName();
  category.getIcon();
  category.validateSubcategory('smth');
}
