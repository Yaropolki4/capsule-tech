import { z } from "zod";

export const createTryOnRequestDtoSchema = z
  .object({
    userPhotoId: z.string(),
    capsuleId: z.string().optional(),
    clothesId: z.string().optional(),
  })
  .refine((data) => Boolean(data.capsuleId) !== Boolean(data.clothesId), {
    message: "Укажите либо вещь, либо капсулу для примерки",
  });

export type CreateTryOnRequestDto = z.infer<typeof createTryOnRequestDtoSchema>;
