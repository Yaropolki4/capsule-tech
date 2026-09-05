import { z } from "zod";

export const createClothesFromWildberriesRequestDtoSchema = z.object({
  name: z.string().min(1),
  brand: z.string().nullable(),
  description: z.string(),
  photo: z.string(),
  url: z.string(),
});

export type CreateClothesFromWildberriesRequestDto = z.infer<
  typeof createClothesFromWildberriesRequestDtoSchema
>;
