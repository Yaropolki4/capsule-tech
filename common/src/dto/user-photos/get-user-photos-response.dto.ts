import { z } from "zod";
import { userPhotoSchema } from "./shared";

export const getUserPhotosResponseDtoSchema = z.array(userPhotoSchema);

export type GetUserPhotosResponseDto = z.infer<
  typeof getUserPhotosResponseDtoSchema
>;
