import { z } from "zod";

export const getFollowingDtoRequestSchema = z.object({
  id: z.string("Некорректный id"),
});

export type GetFollowingDtoRequest = z.infer<
  typeof getFollowingDtoRequestSchema
>;
