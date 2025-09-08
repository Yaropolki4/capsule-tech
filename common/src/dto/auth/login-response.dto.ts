import { userSchema } from "../shared/user";
import { z } from "zod";

export type LoginDtoResponse = z.infer<typeof loginDtoResponseSchema>;

export const loginDtoResponseSchema = z.object({
  accessToken: z.string(),
  user: userSchema,
});
