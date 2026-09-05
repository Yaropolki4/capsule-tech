import { z } from "zod";

export const removeClothesRequestDtoSchema = z.object({
  id: z.string(),
});

export type RemoveClothesRequestDto = z.infer<
  typeof removeClothesRequestDtoSchema
>;
