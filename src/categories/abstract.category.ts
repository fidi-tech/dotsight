export type CategoryId = string;
export type SubcategoryId = string;

class CategoryIdNotSpecifiedError extends Error {}
class CategorySubcategoryValidatorNotSpecifiedError extends Error {}
class CategoryNameNotSpecifiedError extends Error {}

export abstract class AbstractCategory {
  getId(): CategoryId {
    throw new CategoryIdNotSpecifiedError();
  }
  validateSubcategory(subcategory: SubcategoryId): boolean {
    throw new CategorySubcategoryValidatorNotSpecifiedError();
  }
  getName(): string {
    throw new CategoryNameNotSpecifiedError();
  }
  getIcon(): string | null {
    return null;
  }
}
