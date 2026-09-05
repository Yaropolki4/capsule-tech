import { z } from "zod";

export const createThreadResponseDtoSchema = z.object({
  id: z.string(),
});

export type CreateThreadResponseDto = z.infer<typeof createThreadResponseDtoSchema>;
