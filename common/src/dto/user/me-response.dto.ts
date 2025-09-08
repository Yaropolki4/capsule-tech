import { userSchema } from "../shared/user";
import { z } from "zod";

export const meResponseDtoSchema = userSchema;

export type MeResponseDto = z.infer<typeof meResponseDtoSchema>;
