import { z } from "zod";
import { clothesCategorySchema } from "./shared";

export const getClothesResponseDtoSchema = z.array(
  z.object({
    brand: z.string().nullable(),
    category: clothesCategorySchema,
    imageUrl: z.string(),
    createdById: z.string(),
    id: z.string(),
    sourceUrl: z.string().nullable(),
  })
);

export type GetClothesResponseDto = z.infer<typeof getClothesResponseDtoSchema>;
