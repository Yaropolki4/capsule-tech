import { z } from "zod";

export type LoginDtoRequest = z.infer<typeof loginDtoRequestSchema>;

export const loginDtoRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(6, "Пароль должен быть не менее 6 символов"),
});
