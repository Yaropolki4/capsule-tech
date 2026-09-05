import { Injectable } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { WildberriesService } from '../wildberries/wildberries.service';

/**
 * Собирает экземпляр MCP-сервера с зарегистрированными инструментами.
 *
 * ВАЖНО: под CVE-2026-25536 в stateless-режиме нельзя переиспользовать
 * один McpServer между запросами — поэтому фабрика создаёт НОВЫЙ
 * экземпляр на каждое подключение (см. контроллер).
 */
@Injectable()
export class McpServerFactory {
  constructor(private readonly wb: WildberriesService) {}

  create(): McpServer {
    const server = new McpServer({
      name: 'wb-search',
      version: '1.0.0',
    });

    const inputSchema = {
      query: z
        .string()
        .describe('Поисковый запрос, например "беспроводные наушники"'),
      minPrice: z.number().optional().describe('Минимальная цена в рублях'),
      maxPrice: z.number().optional().describe('Максимальная цена в рублях'),
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe('Сколько товаров вернуть (по умолчанию 10)'),
      sort: z
        .enum(['popular', 'priceup', 'pricedown', 'rate', 'newly'])
        .optional()
        .describe('Сортировка результатов'),
    };

    // Известная особенность SDK v1 + zod: строгий вывод типов схемы уходит
    // слишком глубоко (TS2589). На рантайм не влияет — подавляем на уровне
    // проверки типов. При миграции на SDK v2 не требуется.
    // @ts-expect-error TS2589: excessively deep type instantiation
    server.registerTool(
      'search_products',
      {
        title: 'Поиск товаров на Wildberries',
        description:
          'Ищет товары на маркетплейсе Wildberries по текстовому запросу. ' +
          'Поддерживает фильтр по цене. Возвращает название, описание, ' +
          'цену, рейтинг и ссылку на фото каждого товара.',
        inputSchema,
      },
      async ({ query, minPrice, maxPrice, limit, sort }) => {
        try {
          const results = await this.wb.search({
            query,
            minPrice,
            maxPrice,
            limit,
            sort,
          });

          if (results.length === 0) {
            return {
              content: [
                {
                  type: 'text',
                  text: 'Ничего не найдено. Попробуй изменить запрос или расширить диапазон цен.',
                },
              ],
            };
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(results, null, 2),
              },
            ],
          };
        } catch (err: any) {
          return {
            isError: true,
            content: [{ type: 'text', text: err.message ?? String(err) }],
          };
        }
      },
    );

    return server;
  }
}
