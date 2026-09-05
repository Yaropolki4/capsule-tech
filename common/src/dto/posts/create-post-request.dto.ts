import { z } from "zod";

export const createPostRequestDtoSchema = z
  .object({
    text: z.string().max(2000, "Слишком длинный текст").optional(),
    capsuleId: z.string().optional(),
    clothesId: z.string().optional(),
  })
  .refine((data) => !(data.capsuleId && data.clothesId), {
    message: "К посту можно прикрепить только капсулу или только вещь",
  })
  .refine((data) => Boolean(data.text?.trim()) || data.capsuleId || data.clothesId, {
    message: "Добавьте текст или вложение",
  });

export type CreatePostRequestDto = z.infer<typeof createPostRequestDtoSchema>;
