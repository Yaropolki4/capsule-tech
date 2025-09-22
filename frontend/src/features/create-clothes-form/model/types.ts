import type { ClothesCategory } from "@capsule/common";

export type Clothes = {
  createdById: string;
  brand: string;
  category: ClothesCategory;
  imageUrl: string;
};
