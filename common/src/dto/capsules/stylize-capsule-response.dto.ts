import { z } from "zod";

export const stylizeCapsuleResponseDtoSchema = z.object({
  styledImageUrl: z.string(),
});

export type StylizeCapsuleResponseDto = z.infer<
  typeof stylizeCapsuleResponseDtoSchema
>;
