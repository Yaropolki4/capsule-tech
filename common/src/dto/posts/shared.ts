import { z } from "zod";
import { clothesCategorySchema } from "../clothes/shared";
import { capsuleAuthorSchema } from "../capsules/shared";

export const postAuthorSchema = capsuleAuthorSchema;

export type PostAuthor = z.infer<typeof postAuthorSchema>;

export const postCapsuleSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  thumbnailUrl: z.string(),
});

export type PostCapsule = z.infer<typeof postCapsuleSchema>;

export const postClothesSchema = z.object({
  id: z.string(),
  imageUrl: z.string(),
  brand: z.string().nullable(),
  category: clothesCategorySchema,
});

export type PostClothes = z.infer<typeof postClothesSchema>;
