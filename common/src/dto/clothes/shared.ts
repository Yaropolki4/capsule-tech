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
    "TSHIRT",
    "TOP",
    "HOODIE",
    "SWEATSHIRT",
    "SWEATER",
    "LONGSLEEVE",
    "BLAZER",
  ],
  "Некорректная категория одежды"
);

export type ClothesCategory = z.infer<typeof clothesCategorySchema>;

export const clothesCategoryLabels: Record<ClothesCategory, string> = {
  SHIRT: "Рубашка",
  PANTS: "Штаны",
  DRESS: "Платье",
  JACKET: "Куртка",
  COAT: "Пальто",
  SKIRT: "Юбка",
  SHORTS: "Шорты",
  JEANS: "Джинсы",
  SWIMWEAR: "Спортивная одежда",
  ACCESSORY: "Аксессуары",
  SHOES: "Обувь",
  BAG: "Сумка",
  OTHER: "Другое",
  UNDERWEAR: "Нижнее белье",
  SLEEPWEAR: "Спальное белье",
  SWIMSUIT: "Купальник",
  TSHIRT: "Футболка",
  TOP: "Топ",
  HOODIE: "Худи",
  SWEATSHIRT: "Свитшот",
  SWEATER: "Свитер",
  LONGSLEEVE: "Лонгслив",
  BLAZER: "Пиджак",
};
