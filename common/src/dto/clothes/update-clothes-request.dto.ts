import { z } from "zod";
import { clothesCategorySchema } from "./shared";

export const updateClothesRequestDtoSchema = z.object({
  brand: z.string().min(1, "Бренд должен быть минимальной длины 1 символ"),
  category: clothesCategorySchema,
}).partial();

export type UpdateClothesRequestDto = z.infer<
  typeof updateClothesRequestDtoSchema
>;
