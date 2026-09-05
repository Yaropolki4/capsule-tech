import { Logger } from '@nestjs/common';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { Gender } from '@prisma/client';
import { CatalogService } from 'src/catalog/catalog.service';

const logger = new Logger('SearchWildberriesTool');

export function createSearchWildberriesTool(
  catalogService: CatalogService,
  excludeExternalIds: string[],
  gender: Gender | null,
) {
  return tool(
    async ({ query, minPrice, maxPrice, limit }) => {
      logger.debug(
        `search_wildberries called: query="${query}" minPrice=${minPrice} maxPrice=${maxPrice} limit=${limit}`,
      );

      try {
        const { source, items } = await catalogService.search(
          {
            query,
            minPrice,
            maxPrice,
            limit: limit ?? 10,
          },
          excludeExternalIds,
          gender,
        );

        logger.debug(
          `search_wildberries found ${items.length} result(s), source=${source}`,
        );

        return JSON.stringify(
          items.map((item) => ({
            name: item.name,
            description: item.description,
            brand: item.brand,
            price: item.price,
            rating: item.rating,
            photo: item.photo,
            url: item.url,
            source,
          })),
        );
      } catch (error) {
        logger.error(
          `search_wildberries failed for query="${query}": ${(error as Error).message}`,
          (error as Error).stack,
        );
        throw error;
      }
    },
    {
      name: 'search_wildberries',
      description:
        'Основной инструмент подбора вещей: ищет реальные товары на маркетплейсе Wildberries по ' +
        'текстовому запросу (живой внешний поиск). Используй его для подбора конкретной вещи. ' +
        'Это неофициальный API — изредка может быть недоступен. Уже показанные в этом диалоге ' +
        'товары автоматически не повторяются в результатах — если пользователь просит другие ' +
        'варианты, просто вызови инструмент заново с похожим запросом.',
      schema: z.object({
        query: z
          .string()
          .describe(
            'Короткий поисковый запрос как в строке маркетплейса, 2-5 слов: тип вещи и, ' +
              'только если пользователь сам это назвал, цвет/стиль/материал. Без повода, ' +
              'контекста и того, с чем сочетать — это не помогает поиску, только удлиняет запрос.',
          ),
        minPrice: z.number().optional().describe('Минимальная цена в рублях'),
        maxPrice: z.number().optional().describe('Максимальная цена в рублях'),
        limit: z
          .number()
          .min(1)
          .max(10)
          .optional()
          .describe('Сколько товаров вернуть, не больше 10 (по умолчанию 10)'),
      }),
    },
  );
}
