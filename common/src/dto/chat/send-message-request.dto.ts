import { z } from "zod";

export const sendMessageRequestDtoSchema = z.object({
  text: z.string().min(1, "Сообщение не может быть пустым"),
});

export type SendMessageRequestDto = z.infer<typeof sendMessageRequestDtoSchema>;
