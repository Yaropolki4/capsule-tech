import { z } from "zod";

export const chatMessageRoleSchema = z.enum(["user", "assistant"]);

export type ChatMessageRole = z.infer<typeof chatMessageRoleSchema>;

export const chatSuggestionDtoSchema = z.object({
  id: z.string(),
  imageUrl: z.string(),
  brand: z.string().nullable(),
  category: z.string(),
});

export type ChatSuggestionDto = z.infer<typeof chatSuggestionDtoSchema>;

// "cache_fallback" — WB был недоступен, и мы отдали ближайшее из кэша, даже
// если оно не прошло обычный порог похожести (см. CatalogService.search).
export const catalogSearchSourceSchema = z.enum([
  "cache",
  "wildberries",
  "cache_fallback",
]);

export type CatalogSearchSourceDto = z.infer<typeof catalogSearchSourceSchema>;

export const wildberriesSuggestionDtoSchema = z.object({
  name: z.string(),
  brand: z.string().nullable(),
  description: z.string(),
  price: z.number().nullable(),
  photo: z.string(),
  url: z.string(),
  source: catalogSearchSourceSchema.optional(),
});

export type WildberriesSuggestionDto = z.infer<
  typeof wildberriesSuggestionDtoSchema
>;

// Текстовый вариант капсулы, который агент предлагает в ответ на абстрактный
// запрос ("хочу капсулу на осень") — до подбора конкретных вещей.
export const capsuleConceptDtoSchema = z.object({
  title: z.string(),
  description: z.string(),
});

export type CapsuleConceptDto = z.infer<typeof capsuleConceptDtoSchema>;

// Результат подбора вещей под спеку капсулы: сами вещи (в той же форме, что
// и обычная подсказка с Wildberries) плюс то, что не удалось найти.
export const capsuleProposalDtoSchema = z.object({
  name: z.string().optional(),
  items: z.array(wildberriesSuggestionDtoSchema).min(1),
  unmatchedDescriptions: z.array(z.string()).optional(),
});

export type CapsuleProposalDto = z.infer<typeof capsuleProposalDtoSchema>;

export const chatMessageDtoSchema = z.object({
  id: z.string(),
  role: chatMessageRoleSchema,
  text: z.string(),
  suggestions: z.array(chatSuggestionDtoSchema).optional(),
  wildberriesSuggestions: z.array(wildberriesSuggestionDtoSchema).optional(),
  capsuleConcepts: z.array(capsuleConceptDtoSchema).optional(),
  capsuleProposal: capsuleProposalDtoSchema.optional(),
});

export type ChatMessageDto = z.infer<typeof chatMessageDtoSchema>;

// Имена инструментов агента — используются, чтобы фронт мог показать
// человекочитаемый статус ("Смотрю гардероб...", "Ищу вещь...") прямо во
// время стриминга ответа, до того как инструмент отработает.
export const chatStreamToolNameSchema = z.enum([
  "get_user_wardrobe",
  "show_wardrobe_items",
  "search_wildberries",
  "create_capsule",
]);

export type ChatStreamToolName = z.infer<typeof chatStreamToolNameSchema>;

export const chatStreamEventDtoSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("user_message"), message: chatMessageDtoSchema }),
  z.object({
    type: z.literal("tool_start"),
    tool: chatStreamToolNameSchema,
    input: z.record(z.string(), z.unknown()).optional(),
  }),
  z.object({
    type: z.literal("tool_end"),
    tool: chatStreamToolNameSchema,
    source: catalogSearchSourceSchema.optional(),
  }),
  z.object({
    type: z.literal("assistant_message"),
    message: chatMessageDtoSchema,
  }),
  z.object({ type: z.literal("error"), message: z.string() }),
  z.object({ type: z.literal("drift_warning"), message: z.string() }),
]);

export type ChatStreamEventDto = z.infer<typeof chatStreamEventDtoSchema>;

export const chatThreadSummaryDtoSchema = z.object({
  id: z.string(),
  title: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ChatThreadSummaryDto = z.infer<typeof chatThreadSummaryDtoSchema>;
