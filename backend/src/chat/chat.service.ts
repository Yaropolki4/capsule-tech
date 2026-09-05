import { Inject, Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import {
  AIMessage,
  BaseMessage,
  BaseMessageLike,
  ToolMessage,
} from '@langchain/core/messages';
import { ChatMessage, ChatMessageRole, ClothesCategory } from '@prisma/client';
import type {
  CapsuleConceptDto,
  CapsuleProposalDto,
  CatalogSearchSourceDto,
  ChatStreamToolName,
} from '@capsule/common';
import { ChatRepository } from './chat.repository';
import { ClothesRepository } from 'src/clothes/clothes.repository';
import { UserRepository } from 'src/user/user.repository';
import { OPENROUTER_CHAT_MODEL } from 'src/llm/openrouter.provider';
import { extractLangchainMessageCostUsd } from 'src/llm/openrouter-cost.util';
import {
  CatalogService,
  extractWildberriesId,
} from 'src/catalog/catalog.service';
import { buildFashionAgent } from './graph/fashion-agent';
import {
  CapsuleAgentService,
  PreviousCapsuleProposal,
} from './capsule-agent/capsule-agent.service';
import { CapsuleAgentResult } from './capsule-agent/capsule-agent.schema';
import { BillingService } from 'src/billing/billing.service';
import { CostAccumulator } from 'src/billing/cost-accumulator';
import { InsufficientTokensException } from 'src/billing/insufficient-tokens.exception';
import { ThreadTitleService } from './thread-title/thread-title.service';
import {
  TopicDriftResult,
  TopicDriftService,
} from './topic-drift/topic-drift.service';

const TOPIC_DRIFT_WARNING_MESSAGE =
  'Похоже, тема разговора резко сменилась — хочешь начать новый чат?';

function messageTextContent(message: BaseMessage): string {
  if (typeof message.content === 'string') {
    return message.content;
  }

  if (Array.isArray(message.content)) {
    return message.content
      .map((block) =>
        typeof block === 'object' && block !== null && 'text' in block
          ? String((block as { text: unknown }).text)
          : '',
      )
      .join('');
  }

  return '';
}

function extractSuggestionClothesIds(messages: BaseMessage[]): string[] {
  const toolMessages = messages.filter(
    (message): message is ToolMessage =>
      message instanceof ToolMessage && message.name === 'show_wardrobe_items',
  );

  const lastToolMessage = toolMessages.at(-1);

  if (!lastToolMessage) {
    return [];
  }

  try {
    const parsed = JSON.parse(messageTextContent(lastToolMessage)) as Array<{
      id: string;
    }>;

    return parsed.slice(0, 3).map((item) => item.id);
  } catch {
    return [];
  }
}

function extractWildberriesSuggestions(
  messages: BaseMessage[],
): WildberriesSuggestion[] {
  const toolMessages = messages.filter(
    (message): message is ToolMessage =>
      message instanceof ToolMessage && message.name === 'search_wildberries',
  );

  const lastToolMessage = toolMessages.at(-1);

  if (!lastToolMessage) {
    return [];
  }

  try {
    const parsed = JSON.parse(messageTextContent(lastToolMessage)) as Array<{
      name: string;
      brand: string | null;
      description: string;
      price: number | null;
      photo: string;
      url: string;
      source?: CatalogSearchSourceDto;
    }>;

    return parsed.slice(0, 3).map((item) => ({
      name: item.name,
      brand: item.brand,
      description: item.description,
      price: item.price,
      photo: item.photo,
      url: item.url,
      source: item.source,
    }));
  } catch {
    return [];
  }
}

function lastCapsuleAgentResult(
  messages: BaseMessage[],
): CapsuleAgentResult | null {
  const toolMessages = messages.filter(
    (message): message is ToolMessage =>
      message instanceof ToolMessage && message.name === 'create_capsule',
  );

  const lastToolMessage = toolMessages.at(-1);

  if (!lastToolMessage) {
    return null;
  }

  try {
    return JSON.parse(
      messageTextContent(lastToolMessage),
    ) as CapsuleAgentResult;
  } catch {
    return null;
  }
}

function extractCapsuleConcepts(
  result: CapsuleAgentResult | null,
): CapsuleConceptDto[] {
  return result?.mode === 'concepts' ? result.concepts : [];
}

function extractCapsuleProposal(
  result: CapsuleAgentResult | null,
): CapsuleProposalDto | null {
  return result?.mode === 'proposal' ? result.proposal : null;
}

/**
 * id вещей с Wildberries, уже показанных пользователю в этом треде — по
 * всей истории сообщений, не только по последнему ответу. История чата,
 * которую видит модель между ходами, хранит только текст, поэтому агент сам
 * не помнит, что уже показывал — эти id передаются в search_wildberries
 * отдельно, чтобы "покажи другие варианты" реально давало другие вещи.
 */
function collectShownWildberriesIds(history: ChatMessage[]): string[] {
  const ids = new Set<string>();

  for (const message of history) {
    const items = message.suggestionWildberriesItems as unknown as Array<{
      url?: string;
    }>;

    for (const item of items ?? []) {
      const id = item?.url ? extractWildberriesId(item.url) : null;

      if (id) ids.add(id);
    }
  }

  return Array.from(ids);
}

/**
 * Последняя показанная пользователю капсула (по всей истории треда) — так
 * же, как и с гардеробом/Wildberries, между ходами модель видит только
 * текст, поэтому агент сам не помнит состав уже показанной капсулы. Эта
 * структура передаётся в create_capsule отдельно, чтобы правки вроде
 * "замени куртку" не требовали пересборки капсулы с нуля.
 */
function lastStoredCapsuleProposal(
  history: ChatMessage[],
): PreviousCapsuleProposal | null {
  for (let i = history.length - 1; i >= 0; i -= 1) {
    const proposal = history[i]
      .capsuleProposal as unknown as CapsuleProposalDto | null;

    if (proposal && proposal.items.length > 0) {
      return proposal;
    }
  }

  return null;
}

/**
 * true, если в этом треде уже когда-либо показывались 3 варианта капсулы —
 * используется вместе с lastStoredCapsuleProposal, чтобы решить, нужно ли
 * ЕЩЁ РАЗ спрашивать LLM "concepts или spec" перед сборкой капсулы. После
 * первого показа вариантов это решение больше не должно приниматься заново:
 * следующий ответ пользователя (выбор варианта, уточнение, правка) обязан
 * вести к конкретной капсуле, а не к новому кругу из 3 вариантов.
 */
function hasShownCapsuleConcepts(history: ChatMessage[]): boolean {
  return history.some((message) => {
    const concepts = message.capsuleConcepts as unknown as
      | CapsuleConceptDto[]
      | null;

    return Boolean(concepts?.length);
  });
}

/**
 * "search_wildberries" — единственный инструмент, для которого мы знаем и
 * умеем показывать источник результата (кэш/живой поиск) — см. CatalogService.
 */
function extractToolResultSource(
  message: ToolMessage,
): CatalogSearchSourceDto | undefined {
  if (message.name !== 'search_wildberries') {
    return undefined;
  }

  try {
    const parsed = JSON.parse(messageTextContent(message)) as Array<{
      source?: CatalogSearchSourceDto;
    }>;

    return parsed[0]?.source;
  } catch {
    return undefined;
  }
}

export type ChatSuggestion = {
  id: string;
  imageUrl: string;
  brand: string | null;
  category: ClothesCategory;
};

export type WildberriesSuggestion = {
  name: string;
  brand: string | null;
  description: string;
  price: number | null;
  photo: string;
  url: string;
  source?: CatalogSearchSourceDto;
};

export type EnrichedChatMessage = ChatMessage & {
  suggestions: ChatSuggestion[];
  wildberriesSuggestions: WildberriesSuggestion[];
  capsuleConcepts: CapsuleConceptDto[];
  capsuleProposal: CapsuleProposalDto | null;
};

export type ChatStreamEvent =
  | { type: 'user_message'; message: EnrichedChatMessage }
  | {
      type: 'tool_start';
      tool: ChatStreamToolName;
      input?: Record<string, unknown>;
    }
  | {
      type: 'tool_end';
      tool: ChatStreamToolName;
      source?: CatalogSearchSourceDto;
    }
  | { type: 'assistant_message'; message: EnrichedChatMessage }
  | { type: 'error'; message: string }
  | { type: 'drift_warning'; message: string };

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly clothesRepository: ClothesRepository,
    private readonly catalogService: CatalogService,
    private readonly capsuleAgentService: CapsuleAgentService,
    private readonly userRepository: UserRepository,
    private readonly billingService: BillingService,
    private readonly threadTitleService: ThreadTitleService,
    private readonly topicDriftService: TopicDriftService,
    @Inject(OPENROUTER_CHAT_MODEL) private readonly chatModel: ChatOpenAI,
  ) {}

  async createThread(userId: string) {
    return this.chatRepository.createThread(userId);
  }

  async listThreads(userId: string) {
    return this.chatRepository.listThreadsForUser(userId);
  }

  async getMessages(threadId: string, userId: string) {
    await this.chatRepository.getThreadForUser(threadId, userId);

    const messages = await this.chatRepository.getMessages(threadId);

    return this.enrichMessages(messages);
  }

  private async enrichMessages(
    messages: ChatMessage[],
  ): Promise<EnrichedChatMessage[]> {
    const allIds = Array.from(
      new Set(messages.flatMap((message) => message.suggestionClothesIds)),
    );

    const clothes = allIds.length
      ? await this.clothesRepository.findManyByIds(allIds)
      : [];

    const clothesById = new Map(clothes.map((item) => [item.id, item]));

    return messages.map((message) => ({
      ...message,
      suggestions: message.suggestionClothesIds
        .map((id) => clothesById.get(id))
        .filter((item): item is ChatSuggestion => Boolean(item)),
      wildberriesSuggestions: (
        message.suggestionWildberriesItems as unknown as WildberriesSuggestion[]
      ).filter(
        (item): item is WildberriesSuggestion =>
          Boolean(item) && typeof item.name === 'string',
      ),
      capsuleConcepts:
        (message.capsuleConcepts as unknown as CapsuleConceptDto[]) ?? [],
      capsuleProposal:
        (message.capsuleProposal as unknown as CapsuleProposalDto | null) ??
        null,
    }));
  }

  async *sendMessage(
    threadId: string,
    userId: string,
    text: string,
  ): AsyncGenerator<ChatStreamEvent> {
    const thread = await this.chatRepository.getThreadForUser(threadId, userId);

    try {
      await this.billingService.assertHasBudget(userId, 'CHAT');
    } catch (error) {
      if (error instanceof InsufficientTokensException) {
        yield {
          type: 'error',
          message: 'Дневной лимит токенов на чат исчерпан, обновится в полночь',
        };

        return;
      }

      throw error;
    }

    const history = await this.chatRepository.getMessages(threadId);

    const userMessage = await this.chatRepository.addMessage({
      threadId,
      role: ChatMessageRole.USER,
      text,
    });

    this.logger.log(
      `[thread ${threadId}] user: "${text}" (history: ${history.length} message(s))`,
    );

    const [enrichedUserMessage] = await this.enrichMessages([userMessage]);

    yield { type: 'user_message', message: enrichedUserMessage };

    if (history.length === 0) {
      // Detached — не блокирует стрим, сама ловит все ошибки внутри.
      void this.threadTitleService.generateAndSave(threadId, userId, text);
    }

    // Стартует параллельно с agent.stream() ниже, но await'ится только после
    // того, как основной ответ уже отдан — не добавляет задержки к самому
    // ответу, только (в худшем случае) к моменту закрытия стрима.
    const driftCheckPromise: Promise<TopicDriftResult> = history.length
      ? this.topicDriftService.check(userId, thread.title, history, text)
      : Promise.resolve({ isDrift: false, reason: null });

    const inputMessages: BaseMessageLike[] = [
      ...history.map(
        (message): BaseMessageLike => ({
          role: message.role === ChatMessageRole.USER ? 'user' : 'assistant',
          content: message.text,
        }),
      ),
      { role: 'user', content: text },
    ];

    const previousCapsuleProposal = lastStoredCapsuleProposal(history);
    const user = await this.userRepository.findById(userId);
    const costAccumulator = new CostAccumulator();

    const agent = buildFashionAgent({
      chatModel: this.chatModel,
      clothesRepository: this.clothesRepository,
      catalogService: this.catalogService,
      capsuleAgentService: this.capsuleAgentService,
      userId,
      excludeWildberriesIds: collectShownWildberriesIds(history),
      previousCapsuleProposal,
      forceCapsuleSpec:
        Boolean(previousCapsuleProposal) || hasShownCapsuleConcepts(history),
      gender: user?.gender ?? null,
      costAccumulator,
    });

    const chargeChatTurn = async () => {
      if (costAccumulator.total <= 0) {
        return;
      }

      try {
        await this.billingService.chargeUsage(userId, 'CHAT', {
          action: 'chat_turn',
          model: this.chatModel.model,
          costUsd: costAccumulator.total,
        });
      } catch (chargeError) {
        this.logger.error(
          `[thread ${threadId}] failed to charge chat turn usage: ${(chargeError as Error).message}`,
          (chargeError as Error).stack,
        );
      }
    };

    // Сообщения, реально произведённые в этом ходе (без сконструированной из
    // текстовой истории части инпута) — из них ниже достаём финальный текст
    // ответа и подсказки, ровно как раньше делалось из result.messages.
    const turnMessages: BaseMessage[] = [];

    try {
      // Стримим только служебные события ("agent решил вызвать тул X",
      // "тул X отработал") — не токены самого ответа. Промежуточные проходы
      // агента (до вызова тула) иногда тоже стримят видимый текст (реплики
      // вроде "секунду, посмотрю..."), и он неотличим на лету от финального
      // ответа — при токенном стриме оба куска просто склеивались в один
      // бессмысленный текст. Поэтому текст ответа отдаём одним куском в
      // конце, в assistant_message, а прогресс показываем через статусы
      // тулов с лоадерами на фронте.
      const stream = await agent.stream(
        { messages: inputMessages },
        { streamMode: 'updates' },
      );

      for await (const rawUpdate of stream) {
        const update = rawUpdate as Record<string, { messages: BaseMessage[] }>;

        if (update.agent) {
          const [aiMessage] = update.agent.messages;

          turnMessages.push(aiMessage);
          costAccumulator.add(extractLangchainMessageCostUsd(aiMessage));

          if (aiMessage instanceof AIMessage && aiMessage.tool_calls?.length) {
            this.logger.log(
              `[thread ${threadId}] model requested tool call(s): ${aiMessage.tool_calls
                .map((call) => `${call.name}(${JSON.stringify(call.args)})`)
                .join(', ')}`,
            );

            for (const call of aiMessage.tool_calls) {
              yield {
                type: 'tool_start',
                tool: call.name as ChatStreamToolName,
                input: call.args,
              };
            }
          }
        }

        if (update.tools) {
          for (const toolMessage of update.tools.messages) {
            turnMessages.push(toolMessage);

            if (toolMessage instanceof ToolMessage) {
              this.logger.log(
                `[thread ${threadId}] tool "${toolMessage.name}" -> status=${toolMessage.status ?? 'success'} ` +
                  `content="${messageTextContent(toolMessage).slice(0, 300)}"`,
              );

              yield {
                type: 'tool_end',
                tool: toolMessage.name as ChatStreamToolName,
                source: extractToolResultSource(toolMessage),
              };
            }
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `[thread ${threadId}] agent.stream() threw: ${(error as Error).message}`,
        (error as Error).stack,
      );

      await chargeChatTurn();

      yield {
        type: 'error',
        message: 'Не получилось получить ответ от AI, попробуй ещё раз.',
      };

      return;
    }

    await chargeChatTurn();

    const lastAiMessage = [...turnMessages]
      .reverse()
      .find((message): message is AIMessage => message instanceof AIMessage);

    const assistantText = lastAiMessage
      ? messageTextContent(lastAiMessage)
      : 'Не получилось сформировать ответ, попробуй ещё раз.';

    this.logger.log(`[thread ${threadId}] assistant: "${assistantText}"`);

    const suggestionClothesIds = extractSuggestionClothesIds(turnMessages);
    const suggestionWildberriesItems =
      extractWildberriesSuggestions(turnMessages);
    const capsuleAgentResult = lastCapsuleAgentResult(turnMessages);
    const capsuleConcepts = extractCapsuleConcepts(capsuleAgentResult);
    const capsuleProposal = extractCapsuleProposal(capsuleAgentResult);

    const assistantMessage = await this.chatRepository.addMessage({
      threadId,
      role: ChatMessageRole.ASSISTANT,
      text: assistantText,
      suggestionClothesIds,
      suggestionWildberriesItems,
      capsuleConcepts,
      capsuleProposal,
    });

    const [enrichedAssistantMessage] = await this.enrichMessages([
      assistantMessage,
    ]);

    yield { type: 'assistant_message', message: enrichedAssistantMessage };

    const driftResult = await driftCheckPromise;

    if (driftResult.isDrift) {
      this.logger.log(
        `[thread ${threadId}] topic drift detected: ${driftResult.reason ?? 'n/a'}`,
      );

      yield { type: 'drift_warning', message: TOPIC_DRIFT_WARNING_MESSAGE };
    }
  }
}
