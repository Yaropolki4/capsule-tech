import { userSchema } from "../shared/user";
import { z } from "zod";

export const editUserResponseDtoSchema = userSchema.pick({
  name: true,
});

export type EditUserResponseDto = z.infer<typeof editUserResponseDtoSchema>;
