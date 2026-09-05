import { Logger } from '@nestjs/common';
import { BaseMessage } from '@langchain/core/messages';

const logger = new Logger('OpenRouterCost');

/**
 * OpenRouter теперь всегда включает `usage.cost` (в USD) в ответ
 * `/chat/completions` — это касается и обычных текстовых, и
 * image-modality-ответов. Читаем сырое поле напрямую из JSON, без похода
 * за прайс-листом моделей.
 */
export function costFromRawUsage(payload: {
  usage?: { cost?: unknown };
}): number {
  const cost = payload.usage?.cost;

  return typeof cost === 'number' ? cost : 0;
}

/**
 * `response_metadata.usage` на AIMessage от @langchain/openai — это
 * shallow-copy сырого `usage` из ответа провайдера, так что кастомное поле
 * OpenRouter `cost` доходит и сюда (подтверждено чтением исходников
 * @langchain/openai в node_modules). Если поле всё же отсутствует —
 * не блокируем пользователя из-за сбоя учёта, просто логируем и считаем 0.
 */
export function extractLangchainMessageCostUsd(message: BaseMessage): number {
  const responseMetadata = message.response_metadata as
    | Record<string, unknown>
    | undefined;
  const usage = responseMetadata?.usage as { cost?: unknown } | undefined;

  if (typeof usage?.cost === 'number') {
    return usage.cost;
  }

  logger.warn(
    `usage.cost missing on response_metadata (message id=${message.id ?? 'unknown'})`,
  );

  return 0;
}
