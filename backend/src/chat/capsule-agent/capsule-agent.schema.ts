import { z } from 'zod';

// Плоские схемы, а не discriminatedUnion с optional-полями: у некоторых
// провайдеров за OpenRouter strict structured output падает с "400 Provider
// returned error" на discriminatedUnion/optional (см. рабочий пример —
// ClothesCharacterizerService — там та же причина: только плоские объекты
// и .nullable() вместо .optional()).

const capsuleSpecItemSchema = z.object({
  query: z
    .string()
    .describe('Короткий поисковый запрос как в строке маркетплейса, 2-5 слов'),
  category: z
    .string()
    .describe(
      'Широкая категория вещи — для повторного поиска, если query ничего не найдёт',
    ),
  color: z.string(),
  description: z.string(),
});

const removeItemIdsField = z
  .array(z.string())
  .nullable()
  .describe(
    'Только при правке уже показанной капсулы (в сообщении есть блок "Текущая капсула"): id ' +
      '(в квадратных скобках перед каждой вещью в этом блоке, например "[id 12345678]") вещей, ' +
      'которые нужно убрать — потому что пользователь прямо попросил убрать их, ИЛИ потому что их ' +
      'заменяет одна из вещей в items. Копируй id ровно как он написан в блоке "Текущая капсула" — ' +
      'не придумывай новый и не используй порядковый номер вещи. Все остальные вещи из "Текущая ' +
      'капсула" останутся без изменений автоматически — их не нужно нигде перечислять. Если блока ' +
      '"Текущая капсула" нет — верни null.',
  );

const clarificationQuestionField = z
  .string()
  .nullable()
  .describe(
    'Заполняй, ТОЛЬКО если из запроса пользователя неясно, какую именно вещь из блока "Текущая ' +
      'капсула" он имеет в виду — например, просит "убери куртку", а в капсуле две куртки, и по ' +
      'тексту непонятно, какую именно. В этом случае верни здесь короткий уточняющий вопрос для ' +
      'пользователя (перечисли, какие именно вещи подходят под описание) и оставь items и ' +
      'removeItemIds пустыми/null — ничего не меняй, пока пользователь не уточнит. Если запрос ' +
      'однозначен или не связан с правкой капсулы — верни null.',
  );

const itemsField = z
  .array(capsuleSpecItemSchema)
  .nullable()
  .describe(
    'Вещи, которые нужно заново найти: вся спека для новой капсулы, либо только новые/заменяемые ' +
      'вещи при правке уже показанной капсулы (старые вещи не повторяй здесь — они останутся ' +
      'автоматически, если их id не в removeItemIds). Null, только если менять/искать вообще ' +
      'нечего (например просто убрали вещь без замены).',
  );

const nameField = z.string().nullable().describe('Название капсулы.');

// Используется, когда решение "concepts vs spec" ещё предстоит принять —
// только для самого первого запроса на капсулу в этом обмене репликами.
export const capsuleAgentPlanSchema = z.object({
  mode: z
    .enum(['concepts', 'spec'])
    .describe(
      '"concepts" — для абстрактного запроса без конкретики (3 варианта капсулы на выбор). ' +
        '"spec" — для детального запроса (спека вещей для подбора).',
    ),
  concepts: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
      }),
    )
    .nullable()
    .describe(
      'Ровно 3 разных варианта капсулы. Заполняй, только если mode="concepts", иначе верни null.',
    ),
  name: nameField,
  items: itemsField,
  removeItemIds: removeItemIdsField,
  clarificationQuestion: clarificationQuestionField,
});

export type CapsuleAgentPlan = z.infer<typeof capsuleAgentPlanSchema>;

// Используется, когда mode="spec" уже решено сервером (не моделью) — либо
// потому что пользователь отвечает на уже показанные 3 варианта капсулы,
// либо потому что правит уже показанную капсулу. У этой схемы физически нет
// поля mode/concepts — модель не может снова "передумать" и вернуть 3
// варианта вместо конкретной капсулы, зацикливание исключено на уровне типов,
// а не только инструкцией в промпте (которую модель иногда игнорировала).
export const capsuleSpecPlanSchema = z.object({
  name: nameField,
  items: itemsField,
  removeItemIds: removeItemIdsField,
  clarificationQuestion: clarificationQuestionField,
});

export type CapsuleSpecPlan = z.infer<typeof capsuleSpecPlanSchema>;

export type CapsuleAgentFoundItem = {
  name: string;
  brand: string | null;
  description: string;
  price: number | null;
  photo: string;
  url: string;
  source?: 'cache' | 'wildberries' | 'cache_fallback';
};

export type CapsuleAgentResult =
  | { mode: 'concepts'; concepts: { title: string; description: string }[] }
  | {
      mode: 'proposal';
      proposal: {
        name?: string;
        items: CapsuleAgentFoundItem[];
        unmatchedDescriptions?: string[];
      };
    }
  | { mode: 'clarification'; question: string };
