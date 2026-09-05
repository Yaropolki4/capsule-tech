import type { ClothesCategory } from "@capsule/common";

export type PostAuthor = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type PostCapsule = {
  id: string;
  name?: string;
  thumbnailUrl: string;
};

export type PostClothes = {
  id: string;
  imageUrl: string;
  brand: string | null;
  category: ClothesCategory;
};

export type PostFeedItem = {
  id: string;
  text?: string;
  createdAt: string;
  createdBy: PostAuthor;
  capsule?: PostCapsule;
  clothes?: PostClothes;
  likesCount: number;
  isLikedByMe: boolean;
};
