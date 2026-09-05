import { z } from 'zod';

// Плоская схема — см. пояснение в capsule-agent.schema.ts про 400 у некоторых
// провайдеров за OpenRouter на discriminatedUnion/optional.
export const topicDriftCheckSchema = z.object({
  isDrift: z
    .boolean()
    .describe(
      'true, только если новое сообщение пользователя — явная, резкая смена ' +
        'темы относительно приведённой истории (например, обсуждали ' +
        'конкретную капсулу/вещь, а теперь вопрос вообще не о гардеробе/' +
        'стиле, или речь заходит о совершенно другом поводе/образе без связи ' +
        'с тем, что обсуждалось). Уточнения, правки, ответы на вопросы ' +
        'ассистента и продолжение той же темы — НЕ считается сменой темы, ' +
        'верни false.',
    ),
  reason: z
    .string()
    .nullable()
    .describe(
      'Коротко, одна фраза, почему — только для логов. null, если isDrift=false.',
    ),
});

export type TopicDriftCheckResult = z.infer<typeof topicDriftCheckSchema>;
