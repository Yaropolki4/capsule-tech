import { Logger } from '@nestjs/common';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { ClothesRepository } from 'src/clothes/clothes.repository';

const logger = new Logger('GetUserWardrobeTool');

export function createGetUserWardrobeTool(
  clothesRepository: ClothesRepository,
  userId: string,
) {
  return tool(
    async () => {
      logger.debug(`get_user_wardrobe called for userId=${userId}`);

      try {
        const items = await clothesRepository.getUserClothes(userId, {
          sortedByCreatedAt: true,
        });

        logger.debug(`get_user_wardrobe found ${items.length} item(s)`);

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
          `get_user_wardrobe failed for userId=${userId}: ${(error as Error).message}`,
          (error as Error).stack,
        );
        throw error;
      }
    },
    {
      name: 'get_user_wardrobe',
      description:
        'Возвращает вещи в гардеробе текущего пользователя: id, бренд, категория, текстовое описание. ' +
        'Только для твоего внутреннего контекста — результат пользователю не показывается. ' +
        'Используй, только если пользователь сам явно сослался на свои вещи или гардероб (например ' +
        '«подбери к моим кроссовкам», «что подойдёт к моей куртке») — не вызывай просто потому что ' +
        'попросили что-то подобрать. Если нужно именно показать пользователю его гардероб карточками ' +
        '— используй show_wardrobe_items.',
      schema: z.object({}),
    },
  );
}
