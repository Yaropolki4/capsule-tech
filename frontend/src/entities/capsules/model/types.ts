import type { ClothesCategory } from "@capsule/common";

export type Capsule = {
  id: string;
  name?: string;
  thumbnailUrl: string;
  public: boolean;
  createdById: string;
  createdAt: string;
};

export type CapsuleAuthor = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type CapsuleItem = {
  id: string;
  clothesId: string;
  imageUrl: string;
  brand: string | null;
  category: ClothesCategory;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
};

export type CapsuleDetail = {
  id: string;
  name?: string;
  thumbnailUrl: string;
  public: boolean;
  createdAt: string;
  createdBy: CapsuleAuthor;
  items: CapsuleItem[];
};

export type PlacedCapsuleItem = {
  clothesId: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
};
