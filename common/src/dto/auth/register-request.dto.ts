import { z } from "zod";

export type RegisterDtoRequest = z.infer<typeof registerDtoRequestSchema>;

export const registerDtoRequestSchema = z.object({
  name: z
    .string({ message: "Имя должно быть строкой" })
    .min(1, "Имя должно быть минимальной длины 1 символ")
    .max(64, "Имя должно быть максимальной длины 64 символа"),
  fullName: z
    .string({ message: "Имя должно быть строкой" })
    .min(1, "Имя должно быть минимальной длины 1 символ")
    .max(255, "Имя должно быть максимальной длины 255 символов"),
  email: z
    .email({ message: "Некорректный email" })
    .max(255, "Email должен быть максимальной длины 255 символов"),
  password: z
    .string()
    .min(6, "Пароль должен быть минимальной длины 6 символов")
    .max(128, "Пароль должен быть максимальной длины 64 символа"),
});
