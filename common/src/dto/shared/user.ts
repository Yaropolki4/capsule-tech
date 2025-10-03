import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  email: z.email("Некорректный email"),
  bio: z.string(),
  capsulesQuantity: z.number(),
  avatarUrl: z.string().optional(),
  fullName: z.string().min(1, "Имя должно быть минимальной длины 1 символ"),
  name: z.string().min(1, "Имя должно быть минимальной длины 1 символ"),
  followersCount: z.number(),
  followingCount: z.number(),
  isSubscribed: z.boolean(),
});
