import { Logger } from '@nestjs/common';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { ClothesRepository } from 'src/clothes/clothes.repository';

const logger = new Logger('ShowWardrobeItemsTool');

export function createShowWardrobeItemsTool(
  clothesRepository: ClothesRepository,
  userId: string,
) {
  return tool(
    async () => {
      logger.debug(`show_wardrobe_items called for userId=${userId}`);

      try {
        const items = await clothesRepository.getUserClothes(userId, {
          sortedByCreatedAt: true,
        });

        logger.debug(`show_wardrobe_items found ${items.length} item(s)`);

        return JSON.stringify(
          items.map((item) => ({
            id: item.id,
            brand: item.brand,
            category: item.category,
            description: item.description,
          })),
        );
      } catch (error) {
        logger.error(
          `show_wardrobe_items failed for userId=${userId}: ${(error as Error).message}`,
          (error as Error).stack,
        );
        throw error;
      }
    },
    {
      name: 'show_wardrobe_items',
      description:
        'Показывает пользователю вещи из его гардероба карточками (с фото и кнопками) прямо в чате. ' +
        'Используй ТОЛЬКО когда пользователь явно просит показать/посмотреть, что у него в гардеробе ' +
        '— а не для того, чтобы просто свериться с гардеробом перед подбором вещи (для этого есть ' +
        'get_user_wardrobe).',
      schema: z.object({}),
    },
  );
}
