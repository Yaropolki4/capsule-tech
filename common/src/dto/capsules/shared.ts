import { z } from "zod";
import { clothesCategorySchema } from "../clothes/shared";

export const capsuleItemInputSchema = z.object({
  clothesId: z.string(),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  rotation: z.number(),
  scale: z.number().positive(),
  zIndex: z.number().int().nonnegative(),
});

export type CapsuleItemInput = z.infer<typeof capsuleItemInputSchema>;

export const capsuleAuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().optional(),
});

export type CapsuleAuthor = z.infer<typeof capsuleAuthorSchema>;
