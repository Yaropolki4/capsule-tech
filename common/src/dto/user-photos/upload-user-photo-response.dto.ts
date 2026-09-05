import { z } from "zod";
import { userPhotoSchema } from "./shared";

export const uploadUserPhotoResponseDtoSchema = userPhotoSchema;

export type UploadUserPhotoResponseDto = z.infer<
  typeof uploadUserPhotoResponseDtoSchema
>;
