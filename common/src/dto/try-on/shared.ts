import { z } from "zod";
import { clothesCategorySchema } from "../clothes/shared";

export const tryOnUserPhotoSchema = z.object({
  id: z.string(),
  imageUrl: z.string(),
});

export type TryOnUserPhoto = z.infer<typeof tryOnUserPhotoSchema>;

export const tryOnClothesSchema = z.object({
  id: z.string(),
  imageUrl: z.string(),
  brand: z.string().nullable(),
  category: clothesCategorySchema,
});

export type TryOnClothes = z.infer<typeof tryOnClothesSchema>;

export const tryOnCapsuleSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  thumbnailUrl: z.string(),
});

export type TryOnCapsule = z.infer<typeof tryOnCapsuleSchema>;

export const tryOnItemSchema = z.object({
  id: z.string(),
  resultImageUrl: z.string(),
  createdAt: z.string(),
  userPhoto: tryOnUserPhotoSchema,
  capsule: tryOnCapsuleSchema.optional(),
  clothes: tryOnClothesSchema.optional(),
});

export type TryOnItem = z.infer<typeof tryOnItemSchema>;
