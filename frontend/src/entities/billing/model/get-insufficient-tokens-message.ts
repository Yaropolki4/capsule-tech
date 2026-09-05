import { insufficientTokensErrorDtoSchema } from "@capsule/common";
import { HttpError } from "@/shared/api/http-error";

const BUCKET_LABELS = {
  CHAT: "Дневной лимит токенов на чат исчерпан",
  PHOTO: "Дневной лимит токенов на AI-фото исчерпан",
} as const;

/**
 * Если ошибка — это ответ 402 INSUFFICIENT_TOKENS от бэкенда, возвращает
 * готовую дружелюбную фразу. Иначе null — вызывающий код падает на свой
 * обычный текст ошибки.
 */
export function describeInsufficientTokensError(
  error: unknown
): string | null {
  if (!(error instanceof HttpError)) {
    return null;
  }

  const parsed = insufficientTokensErrorDtoSchema.safeParse(error.data);

  if (!parsed.success) {
    return null;
  }

  return `${BUCKET_LABELS[parsed.data.bucket]} — обновится в полночь`;
}
