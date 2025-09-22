import { z } from "zod";
import { clothesCategorySchema } from "./shared";

export const createClothesRequestDtoSchema = z.object({
  brand: z.string().min(1, "Бренд должен быть минимальной длины 1 символ"),
  category: clothesCategorySchema,
});

export type CreateClothesRequestDto = z.infer<
  typeof createClothesRequestDtoSchema
>;
