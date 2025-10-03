import { z } from "zod";
import { userSchema } from "../shared/user";

export const getSubscribersResponseDtoSchema = z.array(
  userSchema.omit({
    email: true,
  })
);

export type GetSubscribersResponseDto = z.infer<
  typeof getSubscribersResponseDtoSchema
>;
