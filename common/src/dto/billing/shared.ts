import { z } from "zod";

export const tokenBucketSchema = z.enum(["CHAT", "PHOTO"]);

export type TokenBucket = z.infer<typeof tokenBucketSchema>;

export const tokenBalanceSchema = z.object({
  remaining: z.number(),
  limit: z.number(),
  resetAt: z.string(),
});

export type TokenBalanceDto = z.infer<typeof tokenBalanceSchema>;
