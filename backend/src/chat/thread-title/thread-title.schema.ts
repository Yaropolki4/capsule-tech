import { z } from 'zod';

// Плоская схема — см. пояснение в capsule-agent.schema.ts про 400 у некоторых
// провайдеров за OpenRouter на discriminatedUnion/optional.
export const threadTitleSchema = z.object({
  title: z
    .string()
    .describe(
      'Короткий заголовок чата по первому сообщению пользователя, 3-6 слов, ' +
        'без кавычек и точки в конце, на языке этого сообщения — как названия ' +
        'чатов в ChatGPT.',
    ),
});

export type ThreadTitleResult = z.infer<typeof threadTitleSchema>;
