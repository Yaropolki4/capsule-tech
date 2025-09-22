import type { ClothesCategory } from "@capsule/common";

export type Clothes = {
  createdById: string;
  imageUrl: string;
  brand: string;
  category: ClothesCategory;
};
