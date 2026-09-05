import { z } from "zod";

export const stylizeCapsuleRequestDtoSchema = z.object({
  itemImageUrls: z
    .array(z.string())
    .min(1, "Добавьте хотя бы одну вещь"),
});

export type StylizeCapsuleRequestDto = z.infer<
  typeof stylizeCapsuleRequestDtoSchema
>;
