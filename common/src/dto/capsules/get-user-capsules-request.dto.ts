import { z } from "zod";

export const getUserCapsulesRequestDtoSchema = z.object({
  userId: z.string(),
});

export type GetUserCapsulesRequestDto = z.infer<
  typeof getUserCapsulesRequestDtoSchema
>;
