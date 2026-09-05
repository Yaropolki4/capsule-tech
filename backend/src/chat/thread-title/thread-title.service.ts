import { Inject, Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { extractLangchainMessageCostUsd } from 'src/llm/openrouter-cost.util';
import { OPENROUTER_CHAT_MODEL } from 'src/llm/openrouter.provider';
import { BillingService } from 'src/billing/billing.service';
import { ChatRepository } from '../chat.repository';
import { THREAD_TITLE_SYSTEM_PROMPT } from './thread-title.prompt';
import { threadTitleSchema } from './thread-title.schema';

const TITLE_MAX_LENGTH = 80;

@Injectable()
export class ThreadTitleService {
  private readonly logger = new Logger(ThreadTitleService.name);

  constructor(
    @Inject(OPENROUTER_CHAT_MODEL) private readonly chatModel: ChatOpenAI,
    private readonly chatRepository: ChatRepository,
    private readonly billingService: BillingService,
  ) {}

  /**
   * Вызывается detached (без await) из ChatService.sendMessage сразу после
   * первого сообщения в треде — не должен ни блокировать стрим ответа, ни
   * ронять процесс необработанным rejection'ом, поэтому ловит всё внутри.
   */
  async generateAndSave(
    threadId: string,
    userId: string,
    firstUserMessage: string,
  ): Promise<void> {
    try {
      const { raw, parsed } = await this.chatModel
        .withStructuredOutput(threadTitleSchema, { includeRaw: true })
        .invoke([
          { role: 'system', content: THREAD_TITLE_SYSTEM_PROMPT },
          { role: 'user', content: firstUserMessage },
        ]);

      const costUsd = extractLangchainMessageCostUsd(raw);

      if (costUsd > 0) {
        await this.billingService.chargeUsage(userId, 'CHAT', {
          action: 'thread_title',
          model: this.chatModel.model,
          costUsd,
        });
      }

      const title = parsed.title.trim().slice(0, TITLE_MAX_LENGTH);

      if (title) {
        await this.chatRepository.setThreadTitle(threadId, title);
      }
    } catch (error) {
      this.logger.error(
        `[thread ${threadId}] title generation failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }
}
