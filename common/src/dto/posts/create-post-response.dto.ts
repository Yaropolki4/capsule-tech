import { z } from "zod";

export const createPostResponseDtoSchema = z.object({
  id: z.string(),
  text: z.string().optional(),
  createdById: z.string(),
  capsuleId: z.string().optional(),
  clothesId: z.string().optional(),
  createdAt: z.string(),
});

export type CreatePostResponseDto = z.infer<typeof createPostResponseDtoSchema>;
