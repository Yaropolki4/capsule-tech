import { z } from "zod";
import { tryOnItemSchema } from "./shared";

export const createTryOnResponseDtoSchema = tryOnItemSchema;

export type CreateTryOnResponseDto = z.infer<
  typeof createTryOnResponseDtoSchema
>;
