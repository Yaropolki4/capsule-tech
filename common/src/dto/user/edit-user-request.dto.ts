import { userSchema } from "../shared/user";
import { z } from "zod";

export const editUserRequestDtoSchema = userSchema
  .pick({
    name: true,
    bio: true,
    fullName: true,
  })
  .partial();

export type EditUserRequestDto = z.infer<typeof editUserRequestDtoSchema>;
