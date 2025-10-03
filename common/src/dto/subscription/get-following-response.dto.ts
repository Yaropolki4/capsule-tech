import { z } from "zod";
import { userSchema } from "../shared/user";

export const getFollowingResponseDtoSchema = z.array(
  userSchema.omit({
    email: true,
  })
);

export type GetFollowingResponseDto = z.infer<
  typeof getFollowingResponseDtoSchema
>;
