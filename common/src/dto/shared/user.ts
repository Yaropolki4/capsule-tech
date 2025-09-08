import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  bio: z.string(),
  capsulesQuantity: z.number(),
  avatarUrl: z.string().nullable(),
  fullName: z.string(),
  name: z.string(),
});
