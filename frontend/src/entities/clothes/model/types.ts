import type { ClothesCategory } from "@capsule/common";

export type Clothes = {
  createdById: string;
  imageUrl: string;
  brand: string | null;
  category: ClothesCategory;
  id: string;
  sourceUrl: string | null;
};
