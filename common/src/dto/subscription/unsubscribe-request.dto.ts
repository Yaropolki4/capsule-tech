import { z } from "zod";

export const unsubscribeDtoRequestSchema = z.object({
  id: z.string("Некорректный id"),
});

export type UnsubscribeDtoRequest = z.infer<typeof unsubscribeDtoRequestSchema>;
