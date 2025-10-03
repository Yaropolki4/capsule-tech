import { z } from "zod";

export const subscribeDtoRequestSchema = z.object({
  id: z.string("Некорректный id"),
});

export type SubscribeDtoRequest = z.infer<typeof subscribeDtoRequestSchema>;
