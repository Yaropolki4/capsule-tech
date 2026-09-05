import { z } from "zod";
import { chatThreadSummaryDtoSchema } from "./shared";

export const getThreadsResponseDtoSchema = z.object({
  items: z.array(chatThreadSummaryDtoSchema),
});

export type GetThreadsResponseDto = z.infer<typeof getThreadsResponseDtoSchema>;
