import type { ClothesCategory } from "@capsule/common";

export type Clothes = {
  createdById: string;
  brand: string | null;
  category: ClothesCategory;
  imageUrl: string;
  id: string;
  sourceUrl: string | null;
};
