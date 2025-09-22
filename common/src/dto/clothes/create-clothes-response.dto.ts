import { z } from "zod";
import { clothesCategorySchema } from "./shared";

export const createClothesResponseDtoSchema = z.object({
  brand: z.string().min(1, "Бренд должен быть минимальной длины 1 символ"),
  category: clothesCategorySchema,
  imageUrl: z.string(),
  createdById: z.string(),
});

export type CreateClothesResponseDto = z.infer<
  typeof createClothesResponseDtoSchema
>;
