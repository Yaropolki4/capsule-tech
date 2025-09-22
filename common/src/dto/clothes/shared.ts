import { z } from "zod";

export const clothesCategorySchema = z.enum(
  [
    "SHIRT",
    "PANTS",
    "DRESS",
    "JACKET",
    "COAT",
    "SKIRT",
    "SHORTS",
    "JEANS",
    "SWIMWEAR",
    "ACCESSORY",
    "SHOES",
    "BAG",
    "OTHER",
    "UNDERWEAR",
    "SLEEPWEAR",
    "SWIMSUIT",
  ],
  "Некорректная категория одежды"
);

export type ClothesCategory = z.infer<typeof clothesCategorySchema>;
