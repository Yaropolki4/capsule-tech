import { z } from "zod";

export const userPhotoSchema = z.object({
  id: z.string(),
  imageUrl: z.string(),
  createdAt: z.string(),
});

export type UserPhoto = z.infer<typeof userPhotoSchema>;
