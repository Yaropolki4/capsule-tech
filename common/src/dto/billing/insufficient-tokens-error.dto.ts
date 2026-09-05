import { z } from "zod";
import { tokenBucketSchema } from "./shared";

export const insufficientTokensErrorDtoSchema = z.object({
  code: z.literal("INSUFFICIENT_TOKENS"),
  bucket: tokenBucketSchema,
  resetAt: z.string(),
});

export type InsufficientTokensErrorDto = z.infer<
  typeof insufficientTokensErrorDtoSchema
>;
