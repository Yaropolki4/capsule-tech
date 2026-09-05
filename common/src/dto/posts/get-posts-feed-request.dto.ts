import { z } from "zod";

export const getPostsFeedRequestDtoSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  userId: z.string().optional(),
});

export type GetPostsFeedRequestDto = z.infer<typeof getPostsFeedRequestDtoSchema>;
