import { Logger } from '@nestjs/common';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { Gender } from '@prisma/client';
import {
  CapsuleAgentService,
  PreviousCapsuleProposal,
} from '../capsule-agent/capsule-agent.service';
import { CostAccumulator } from 'src/billing/cost-accumulator';

const logger = new Logger('CreateCapsuleTool');

export function createCreateCapsuleTool(
  capsuleAgentService: CapsuleAgentService,
  excludeWildberriesIds: string[],
  previousProposal: PreviousCapsuleProposal | null,
  forceSpec: boolean,
  gender: Gender | null,
  costAccumulator: CostAccumulator,
) {
  return tool(
    async ({ brief }) => {
      logger.debug(`create_capsule called: brief="${brief}"`);

      try {
        const result = await capsuleAgentService.run(
          brief,
          excludeWildberriesIds,
          previousProposal,
          forceSpec,
          gender,
          costAccumulator,
        );

        logger.debug(`create_capsule result: mode=${result.mode}`);

        return JSON.stringify(result);
      } catch (error) {
        logger.error(
          `create_capsule failed for brief="${brief}": ${(error as Error).message}`,
          (error as Error).stack,
        );
        throw error;
      }
    },
    {
      name: 'create_capsule',
      description:
        'Используй, когда пользователь просит собрать капсулу, образ или лук из нескольких вещей ' +
        '(а не подобрать одну конкретную вещь), а также когда просит изменить/заменить/убрать/' +
        'добавить вещь в уже показанной ранее капсуле. Инструмент сам решит, достаточно ли деталей ' +
        'в запросе: если да — придумает сочетающиеся вещи и найдёт их, если запрос абстрактный — ' +
        'предложит 3 текстовых варианта капсулы на выбор. При правке уже показанной капсулы сам ' +
        'сохранит вещи, которые пользователь не просил менять. Результат пользователю показывает ' +
        'приложение карточками — не пересказывай его текстом.',
      schema: z.object({
        brief: z
          .string()
          .describe(
            'Запрос пользователя на капсулу как можно детальнее — включая всё, что он сказал ' +
              'про стиль, цвета, повод, конкретные вещи, а также текст выбранного им ранее ' +
              'варианта капсулы, если он есть.',
          ),
      }),
    },
  );
}
