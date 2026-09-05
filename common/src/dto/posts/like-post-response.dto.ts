import { z } from "zod";

export const likePostResponseDtoSchema = z.object({
  likesCount: z.number(),
  isLikedByMe: z.boolean(),
});

export type LikePostResponseDto = z.infer<typeof likePostResponseDtoSchema>;
