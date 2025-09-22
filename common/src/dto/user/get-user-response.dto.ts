import { userSchema } from "../shared/user";
import { z } from "zod";

export const getUserByNameResponseDtoSchema = userSchema.omit({
  email: true,
});

export type GetUserByNameResponseDto = z.infer<
  typeof getUserByNameResponseDtoSchema
>;
