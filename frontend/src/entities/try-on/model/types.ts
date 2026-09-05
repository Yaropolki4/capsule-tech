import type { ClothesCategory } from "@capsule/common";

export type TryOn = {
  id: string;
  resultImageUrl: string;
  createdAt: string;
  userPhoto: { id: string; imageUrl: string };
  capsule?: { id: string; name?: string; thumbnailUrl: string };
  clothes?: {
    id: string;
    imageUrl: string;
    brand: string | null;
    category: ClothesCategory;
  };
};
