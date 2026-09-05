import { z } from "zod";

export const uploadCapsuleThumbnailResponseDtoSchema = z.object({
  thumbnailUrl: z.string(),
});

export type UploadCapsuleThumbnailResponseDto = z.infer<
  typeof uploadCapsuleThumbnailResponseDtoSchema
>;
