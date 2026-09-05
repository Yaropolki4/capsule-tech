import { z } from "zod";

export const createCapsuleResponseDtoSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  thumbnailUrl: z.string(),
  public: z.boolean(),
  createdById: z.string(),
  createdAt: z.string(),
});

export type CreateCapsuleResponseDto = z.infer<
  typeof createCapsuleResponseDtoSchema
>;
