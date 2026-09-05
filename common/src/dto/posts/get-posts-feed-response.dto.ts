import { z } from "zod";
import { postAuthorSchema, postCapsuleSchema, postClothesSchema } from "./shared";

export const getPostsFeedResponseDtoSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      text: z.string().optional(),
      createdAt: z.string(),
      createdBy: postAuthorSchema,
      capsule: postCapsuleSchema.optional(),
      clothes: postClothesSchema.optional(),
      likesCount: z.number(),
      isLikedByMe: z.boolean(),
    })
  ),
  nextCursor: z.string().nullable(),
});

export type GetPostsFeedResponseDto = z.infer<typeof getPostsFeedResponseDtoSchema>;
