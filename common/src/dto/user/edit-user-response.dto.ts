import { userSchema } from "../shared/user";
import { z } from "zod";

export const editUserResponseDtoSchema = userSchema.omit({
  email: true,
});

export type EditUserResponseDto = z.infer<typeof editUserResponseDtoSchema>;
