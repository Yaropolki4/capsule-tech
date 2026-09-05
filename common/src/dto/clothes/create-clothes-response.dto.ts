import { z } from "zod";
import { clothesCategorySchema } from "./shared";

export const createClothesResponseDtoSchema = z.object({
  brand: z.string().nullable(),
  category: clothesCategorySchema,
  imageUrl: z.string(),
  createdById: z.string(),
  id: z.string(),
  sourceUrl: z.string().nullable(),
});

export type CreateClothesResponseDto = z.infer<
  typeof createClothesResponseDtoSchema
>;
