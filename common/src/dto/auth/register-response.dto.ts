import { z } from "zod";
import { userSchema } from "../shared/user";

export type RegisterDtoResponse = z.infer<typeof registerDtoResponseSchema>;

export const registerDtoResponseSchema = z.object({
  accessToken: z.string(),
  user: userSchema,
});
