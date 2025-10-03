import { z } from "zod";

export const getSubscribersDtoRequestSchema = z.object({
  id: z.string("Некорректный id"),
});

export type GetSubscribersDtoRequest = z.infer<
  typeof getSubscribersDtoRequestSchema
>;
