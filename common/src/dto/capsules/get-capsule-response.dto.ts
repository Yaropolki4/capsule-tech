import { z } from "zod";
import { clothesCategorySchema } from "../clothes/shared";
import { capsuleAuthorSchema } from "./shared";

export const getCapsuleResponseDtoSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  thumbnailUrl: z.string(),
  public: z.boolean(),
  createdAt: z.string(),
  createdBy: capsuleAuthorSchema,
  items: z.array(
    z.object({
      id: z.string(),
      clothesId: z.string(),
      imageUrl: z.string(),
      brand: z.string().nullable(),
      category: clothesCategorySchema,
      x: z.number(),
      y: z.number(),
      rotation: z.number(),
      scale: z.number(),
      zIndex: z.number(),
    })
  ),
});

export type GetCapsuleResponseDto = z.infer<typeof getCapsuleResponseDtoSchema>;
