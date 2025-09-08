import { z } from "zod";

export type RegisterDtoRequest = z.infer<typeof registerDtoRequestSchema>;

export const registerDtoRequestSchema = z.object({
  name: z
    .string({ message: "Имя должно быть строкой" })
    .min(1, "Имя должно быть минимальной длины 1 символ"),
  fullName: z
    .string({ message: "Имя должно быть строкой" })
    .min(1, "Имя должно быть минимальной длины 1 символ"),
  email: z.string().email({ message: "Некорректный email" }),
  password: z
    .string()
    .min(6, "Пароль должен быть минимальной длины 6 символов"),
});
