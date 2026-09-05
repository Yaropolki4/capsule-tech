import type { ClothesCategory } from "@capsule/common";

export const CATEGORY_GROUPS = [
  "Все",
  "Верх",
  "Низ",
  "Верхняя одежда",
  "Обувь",
  "Аксессуары",
  "Другое",
] as const;

export type CategoryGroup = (typeof CATEGORY_GROUPS)[number];

export const mapCategoryToGroup: Record<
  ClothesCategory,
  Exclude<CategoryGroup, "Все">
> = {
  SHIRT: "Верх",
  DRESS: "Верх",
  PANTS: "Низ",
  SKIRT: "Низ",
  SHORTS: "Низ",
  JEANS: "Низ",
  JACKET: "Верхняя одежда",
  COAT: "Верхняя одежда",
  SHOES: "Обувь",
  ACCESSORY: "Аксессуары",
  BAG: "Аксессуары",
  OTHER: "Другое",
  UNDERWEAR: "Другое",
  SLEEPWEAR: "Другое",
  SWIMSUIT: "Другое",
  SWIMWEAR: "Другое",
  TSHIRT: "Верх",
  TOP: "Верх",
  HOODIE: "Верх",
  SWEATSHIRT: "Верх",
  SWEATER: "Верх",
  LONGSLEEVE: "Верх",
  BLAZER: "Верхняя одежда",
};
