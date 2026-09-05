import { z } from "zod";
import { tryOnItemSchema } from "./shared";

export const getTryOnsResponseDtoSchema = z.array(tryOnItemSchema);

export type GetTryOnsResponseDto = z.infer<typeof getTryOnsResponseDtoSchema>;
