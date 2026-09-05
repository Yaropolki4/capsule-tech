import { z } from "zod";
import { capsuleItemInputSchema } from "./shared";

export const createCapsuleRequestDtoSchema = z.object({
  name: z.string().optional(),
  thumbnailUrl: z.string(),
  items: z.array(capsuleItemInputSchema).min(1, "Добавьте хотя бы одну вещь"),
  public: z.boolean().default(true),
});

export type CreateCapsuleRequestDto = z.infer<
  typeof createCapsuleRequestDtoSchema
>;
