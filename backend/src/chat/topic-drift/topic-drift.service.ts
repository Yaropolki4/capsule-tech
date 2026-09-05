import { Inject, Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { ChatMessage, ChatMessageRole } from '@prisma/client';
import { extractLangchainMessageCostUsd } from 'src/llm/openrouter-cost.util';
import { OPENROUTER_CHAT_MODEL } from 'src/llm/openrouter.provider';
import { BillingService } from 'src/billing/billing.service';
import {
  DRIFT_CHECK_HISTORY_SIZE,
  TOPIC_DRIFT_SYSTEM_PROMPT,
} from './topic-drift.prompt';
import { topicDriftCheckSchema } from './topic-drift.schema';

export type TopicDriftResult = { isDrift: boolean; reason: string | null };

const NO_DRIFT: TopicDriftResult = { isDrift: false, reason: null };

function buildTranscript(history: ChatMessage[]): string {
  return history
    .slice(-DRIFT_CHECK_HISTORY_SIZE)
    .map((message) =>
      message.role === ChatMessageRole.USER
        ? `Пользователь: ${message.text}`
        : `Ассистент: ${message.text}`,
    )
    .join('\n');
}

@Injectable()
export class TopicDriftService {
  private readonly logger = new Logger(TopicDriftService.name);

  constructor(
    @Inject(OPENROUTER_CHAT_MODEL) private readonly chatModel: ChatOpenAI,
    private readonly billingService: BillingService,
  ) {}

  /**
   * Запускается параллельно с основным ответом агента (не блокирует его) —
   * на любой сбой должен молча вернуть "нет смены темы", а не ронять ход
   * чата и не задерживать закрытие стрима дольше основного ответа.
   */
  async check(
    userId: string,
    threadTitle: string | null,
    recentHistory: ChatMessage[],
    newUserMessage: string,
  ): Promise<TopicDriftResult> {
    try {
      const titleHint = threadTitle
        ? `Текущая тема чата: ${threadTitle}\n\n`
        : '';
      const userContent =
        `${titleHint}История диалога:\n${buildTranscript(recentHistory)}\n\n` +
        `Новое сообщение пользователя: ${newUserMessage}`;

      const { raw, parsed } = await this.chatModel
        .withStructuredOutput(topicDriftCheckSchema, { includeRaw: true })
        .invoke([
          { role: 'system', content: TOPIC_DRIFT_SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ]);

      const costUsd = extractLangchainMessageCostUsd(raw);

      if (costUsd > 0) {
        await this.billingService.chargeUsage(userId, 'CHAT', {
          action: 'drift_check',
          model: this.chatModel.model,
          costUsd,
        });
      }

      return { isDrift: parsed.isDrift, reason: parsed.reason };
    } catch (error) {
      this.logger.error(
        `topic drift check failed: ${(error as Error).message}`,
        (error as Error).stack,
      );

      return NO_DRIFT;
    }
  }
}
