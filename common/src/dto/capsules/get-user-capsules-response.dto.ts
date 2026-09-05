import { z } from "zod";

export const getUserCapsulesResponseDtoSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string().optional(),
    thumbnailUrl: z.string(),
    public: z.boolean(),
    createdById: z.string(),
    createdAt: z.string(),
  })
);

export type GetUserCapsulesResponseDto = z.infer<
  typeof getUserCapsulesResponseDtoSchema
>;
