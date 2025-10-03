import { z } from "zod";

export const getClothesRequestDtoSchema = z.object({
  userId: z.string(),
});

export type GetClothesRequestDto = z.infer<typeof getClothesRequestDtoSchema>;
