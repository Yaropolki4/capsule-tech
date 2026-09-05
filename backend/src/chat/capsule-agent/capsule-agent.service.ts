import { Inject, Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { Gender } from '@prisma/client';
import { OPENROUTER_CHAT_MODEL } from 'src/llm/openrouter.provider';
import { extractLangchainMessageCostUsd } from 'src/llm/openrouter-cost.util';
import {
  CatalogService,
  extractWildberriesId,
} from 'src/catalog/catalog.service';
import { CostAccumulator } from 'src/billing/cost-accumulator';
import {
  CAPSULE_AGENT_SYSTEM_PROMPT,
  CAPSULE_SPEC_SYSTEM_PROMPT,
} from './capsule-agent.prompt';
import {
  capsuleAgentPlanSchema,
  capsuleSpecPlanSchema,
  CapsuleAgentFoundItem,
  CapsuleAgentResult,
  CapsuleSpecPlan,
} from './capsule-agent.schema';

const ITEM_SEARCH_LIMIT = 5;

export type PreviousCapsuleProposal = {
  name?: string;
  items: CapsuleAgentFoundItem[];
};

// Стабильная ссылка на вещь для removeItemIds — WB-артикул, если его можно
// вытащить из url, иначе сам url. Не позиция в списке: список может быть
// показан в другом порядке или содержать похожие вещи, а порядковый номер
// в такой ситуации моделью легко перепутывается.
function itemRef(item: CapsuleAgentFoundItem): string {
  return extractWildberriesId(item.url) ?? item.url;
}

// Модель иногда копирует id вместе с оформлением из подсказки ("[id
// 12345678]", "id 12345678"), а не только само значение — сравнение по
// itemRef() тогда не совпадёт и вещь молча не удалится. Нормализуем то, что
// вернула модель, а не полагаемся на точное соблюдение формата.
function normalizeItemId(raw: string): string {
  return raw
    .replace(/[[\]]/g, '')
    .replace(/^id[\s:]*/i, '')
    .trim();
}

// Модель уже просят вписывать цвет прямо в query, но она не всегда это
// делает — а именно цвет обычно и есть та конкретика, которую называет
// пользователь при просьбе добавить/заменить вещь. Подстраховываемся и
// добавляем его на сервере, если он ещё не упомянут в запросе.
function withColor(query: string, color: string): string {
  if (!color || query.toLowerCase().includes(color.toLowerCase())) {
    return query;
  }

  return `${color} ${query}`;
}

function buildPreviousProposalContext(
  previousProposal: PreviousCapsuleProposal,
): string {
  const itemLines = previousProposal.items
    .map((item) => {
      const title = item.brand ? `${item.name} — ${item.brand}` : item.name;

      return `[id ${itemRef(item)}] ${title}. ${item.description}`;
    })
    .join('\n');

  return `Текущая капсула (уже показана пользователю):\n${itemLines}`;
}

@Injectable()
export class CapsuleAgentService {
  private readonly logger = new Logger(CapsuleAgentService.name);

  constructor(
    @Inject(OPENROUTER_CHAT_MODEL) private readonly chatModel: ChatOpenAI,
    private readonly catalogService: CatalogService,
  ) {}

  /**
   * forceSpec=true пропускает решение "concepts vs spec" целиком — схема
   * структурированного вывода в этом случае физически не содержит поля
   * mode/concepts, так что модель не может снова вернуть варианты вместо
   * конкретной капсулы. Используется, когда сервер уже знает (из истории
   * треда), что варианты капсулы либо уже были показаны, либо сейчас
   * правится уже существующая капсула — раньше это была просто инструкция
   * в промпте ("всегда используй mode: spec"), и модель иногда её
   * игнорировала, из-за чего варианты предлагались заново до бесконечности.
   */
  async run(
    brief: string,
    excludeWildberriesIds: string[],
    previousProposal?: PreviousCapsuleProposal | null,
    forceSpec = false,
    gender?: Gender | null,
    costAccumulator?: CostAccumulator,
  ): Promise<CapsuleAgentResult> {
    const userContent =
      previousProposal && previousProposal.items.length > 0
        ? `${buildPreviousProposalContext(previousProposal)}\n\nЗапрос пользователя: ${brief}`
        : brief;

    if (forceSpec) {
      const { raw, parsed: plan } = await this.chatModel
        .withStructuredOutput(capsuleSpecPlanSchema, { includeRaw: true })
        .invoke([
          { role: 'system', content: CAPSULE_SPEC_SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ]);

      costAccumulator?.add(extractLangchainMessageCostUsd(raw));

      if (plan.clarificationQuestion) {
        this.logger.log('create_capsule: запрос неоднозначен, уточняю');

        return { mode: 'clarification', question: plan.clarificationQuestion };
      }

      return this.buildProposal(
        plan,
        excludeWildberriesIds,
        previousProposal ?? null,
        gender,
      );
    }

    const { raw, parsed: plan } = await this.chatModel
      .withStructuredOutput(capsuleAgentPlanSchema, { includeRaw: true })
      .invoke([
        { role: 'system', content: CAPSULE_AGENT_SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ]);

    costAccumulator?.add(extractLangchainMessageCostUsd(raw));

    if (plan.mode === 'concepts') {
      const concepts = plan.concepts ?? [];

      if (concepts.length === 0) {
        throw new Error('create_capsule: mode=concepts, но concepts пуст');
      }

      this.logger.log(
        `create_capsule: абстрактный запрос, придумано ${concepts.length} концепции(й)`,
      );

      return { mode: 'concepts', concepts };
    }

    if (plan.clarificationQuestion) {
      this.logger.log('create_capsule: запрос неоднозначен, уточняю');

      return { mode: 'clarification', question: plan.clarificationQuestion };
    }

    return this.buildProposal(
      plan,
      excludeWildberriesIds,
      previousProposal ?? null,
      gender,
    );
  }

  private async buildProposal(
    plan: CapsuleSpecPlan,
    excludeWildberriesIds: string[],
    previousProposal: PreviousCapsuleProposal | null,
    gender?: Gender | null,
  ): Promise<CapsuleAgentResult> {
    const specItems = plan.items ?? [];
    const removeIds = new Set((plan.removeItemIds ?? []).map(normalizeItemId));

    // По умолчанию остаются ВСЕ вещи прошлой капсулы, кроме явно убранных —
    // модели нужно назвать только разницу (что убрать, что искать заново),
    // а не заново перечислять всё, что остаётся. Сверяем по стабильному id
    // вещи (см. itemRef), а не по позиции в списке — так правка не ломается
    // из-за другого порядка показа или похожих друг на друга вещей.
    const keptItems = previousProposal
      ? previousProposal.items.filter((item) => !removeIds.has(itemRef(item)))
      : [];

    if (specItems.length === 0 && keptItems.length === 0) {
      throw new Error(
        'create_capsule: mode=spec, но нет ни новых вещей, ни вещей для сохранения',
      );
    }

    this.logger.log(
      `create_capsule: детальный запрос — ${specItems.length} вещи(ей) искать заново, ` +
        `${keptItems.length} осталось из прошлой капсулы. removeItemIds модели=` +
        `${JSON.stringify(plan.removeItemIds)}, id прошлой капсулы=` +
        `${JSON.stringify(previousProposal?.items.map(itemRef) ?? [])}`,
    );

    const items: CapsuleAgentFoundItem[] = [...keptItems];
    const unmatchedDescriptions: string[] = [];

    // Растёт по ходу подбора: без этого разные пункты спеки (например два
    // расплывчатых запроса вроде "футболка") могли получить один и тот же
    // товар с Wildberries, а вещь, которая остаётся в капсуле (keptItems),
    // могла быть подобрана заново под видом "новой".
    const usedIds = new Set([
      ...excludeWildberriesIds,
      ...keptItems.map(itemRef),
    ]);

    for (const specItem of specItems) {
      const query = withColor(specItem.query, specItem.color);
      const category = withColor(specItem.category, specItem.color);
      const exclude = Array.from(usedIds);

      const found =
        (await this.findItem(query, exclude, gender)) ??
        (await this.findItem(category, exclude, gender));

      if (found) {
        items.push(found);
        usedIds.add(itemRef(found));
      } else {
        unmatchedDescriptions.push(specItem.description);
      }
    }

    // Подстраховка от дублей, которые могли попасть в keptItems ещё до
    // этого фикса (капсула, сохранённая в более старом сообщении треда) —
    // usedIds выше защищает только вещи, найденные в этом вызове.
    const seenIds = new Set<string>();
    const dedupedItems = items.filter((item) => {
      const ref = itemRef(item);

      if (seenIds.has(ref)) return false;
      seenIds.add(ref);

      return true;
    });

    // capsuleProposalDtoSchema требует хотя бы одну вещь — если не нашлось
    // вообще ничего (и нечего было оставить из прошлой капсулы), отдаём это
    // как ошибку тула, а не пустое предложение: ReAct-агент сам объяснит
    // пользователю, что не получилось, и предложит альтернативу (см.
    // обработку ошибок тулов в ChatService).
    if (dedupedItems.length === 0) {
      throw new Error(
        'create_capsule: не удалось найти ни одной вещи из спеки',
      );
    }

    return {
      mode: 'proposal',
      proposal: {
        name: plan.name ?? previousProposal?.name ?? undefined,
        items: dedupedItems,
        unmatchedDescriptions: unmatchedDescriptions.length
          ? unmatchedDescriptions
          : undefined,
      },
    };
  }

  private async findItem(
    query: string,
    excludeWildberriesIds: string[],
    gender?: Gender | null,
  ): Promise<CapsuleAgentFoundItem | null> {
    try {
      const { source, items } = await this.catalogService.search(
        { query, limit: ITEM_SEARCH_LIMIT },
        excludeWildberriesIds,
        gender,
      );

      const [first] = items;

      if (!first) {
        return null;
      }

      return {
        name: first.name,
        brand: first.brand,
        description: first.description,
        price: first.price,
        photo: first.photo,
        url: first.url,
        source,
      };
    } catch (error) {
      this.logger.error(
        `create_capsule: поиск по запросу "${query}" упал: ${(error as Error).message}`,
        (error as Error).stack,
      );

      return null;
    }
  }
}
