import { Injectable, Logger } from '@nestjs/common';
import { ClothesSource, Gender } from '@prisma/client';
import {
  WildberriesService,
  SearchParams,
  ProductResult,
} from 'src/wildberries/wildberries.service';
import { EmbeddingsService } from 'src/llm/embeddings.service';
import { ClothesCharacterizerService } from 'src/llm/clothes-characterizer.service';
import { CatalogRepository, CatalogSearchRow } from './catalog.repository';

// Косинусная дистанция pgvector (0 — идентичные вектора, 2 — противоположные).
// Уточнено по реальным дистанциям из логов "Кэш-поиск" — 0.18 был слишком
// строгим и почти всегда промахивался даже по релевантным вещам.
const SIMILARITY_DISTANCE_THRESHOLD = 0.32;

// Слова, которыми уточняем поисковый запрос по полу пользователя — и для
// живого поиска на Wildberries, и для векторного поиска по кэшу (агент сам
// никогда не добавляет пол в query, см. системный промпт).
const GENDER_QUERY_SUFFIX: Record<Gender, string> = {
  MALE: 'мужской',
  FEMALE: 'женское, женский',
};

function applyGenderToQuery(query: string, gender?: Gender | null): string {
  return gender ? `${query} ${GENDER_QUERY_SUFFIX[gender]}` : query;
}

export type CatalogSearchSource = 'cache' | 'wildberries' | 'cache_fallback';

export interface CatalogSearchResult {
  source: CatalogSearchSource;
  items: ProductResult[];
}

export function extractWildberriesId(url: string): string | null {
  const match = url.match(/\/catalog\/(\d+)\//);

  return match ? match[1] : null;
}

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(
    private readonly wildberriesService: WildberriesService,
    private readonly embeddingsService: EmbeddingsService,
    private readonly clothesCharacterizerService: ClothesCharacterizerService,
    private readonly catalogRepository: CatalogRepository,
  ) {}

  /**
   * Двухшаговый поиск товаров:
   * 1) ищем среди уже закэшированных/пресетных вещей по векторной близости
   *    к запросу — если что-то похожее нашлось, WB вообще не дёргаем;
   * 2) если непохоже ни на что — идём в реальный поиск WB, а результат
   *    сохраняем в кэш (в фоне, не блокируя ответ) для будущих запросов.
   * Если WB на втором шаге упал (429, недоступен и т.п.), а в кэше всё же
   * что-то отдалённо похожее находилось — лучше отдать это, чем ошибку.
   *
   * excludeExternalIds — id вещей с Wildberries, уже показанных пользователю
   * в этом треде. История чата между ходами хранит только текст (без
   * результатов тулов), так что агент сам не помнит, что уже показывал —
   * "покажи другие шорты" работает только если мы сами отфильтруем то, что
   * уже отдавали, а не полагаемся на память модели.
   */
  async search(
    params: SearchParams,
    excludeExternalIds: string[] = [],
    gender?: Gender | null,
  ): Promise<CatalogSearchResult> {
    const searchParams: SearchParams = {
      ...params,
      query: applyGenderToQuery(params.query, gender),
    };
    const limit = searchParams.limit ?? 10;

    const { hits, candidates } = await this.searchCache(
      searchParams,
      limit,
      excludeExternalIds,
      gender,
    );

    if (hits.length > 0) {
      this.logger.log(
        `search: кэш-хит по запросу "${searchParams.query}" (${hits.length} товар(ов)), WB не вызывался`,
      );

      return { source: 'cache', items: hits };
    }

    this.logger.log(
      `search: кэш-промах по запросу "${searchParams.query}", идём в WB`,
    );

    try {
      // Просим у WB запас с горкой, а не ровно limit — только так после
      // вычёркивания уже показанных вещей останется что показать заново.
      const excludeSet = new Set(excludeExternalIds);
      const fetchLimit = excludeSet.size > 0 ? Math.max(limit * 3, 20) : limit;

      const rawResults = await this.wildberriesService.search({
        ...searchParams,
        limit: fetchLimit,
      });

      void this.cacheResults(searchParams.query, rawResults).catch(
        (error: Error) => {
          this.logger.warn(
            `Не удалось закэшировать результаты WB для запроса "${searchParams.query}": ${error.message}`,
          );
        },
      );

      const results = rawResults
        .filter((item) => {
          const id = extractWildberriesId(item.url);

          return !id || !excludeSet.has(id);
        })
        .slice(0, limit);

      return { source: 'wildberries', items: results };
    } catch (error) {
      const fallback = this.filterByPrice(
        candidates,
        searchParams.minPrice,
        searchParams.maxPrice,
      )
        .slice(0, limit)
        .map((row) => this.toProductResult(row));

      if (fallback.length === 0) {
        throw error;
      }

      this.logger.warn(
        `WB недоступен для запроса "${searchParams.query}" (${(error as Error).message}), ` +
          `отдаю ${fallback.length} ближайших вещей из кэша, не прошедших порог похожести`,
      );

      return { source: 'cache_fallback', items: fallback };
    }
  }

  private async searchCache(
    params: SearchParams,
    limit: number,
    excludeExternalIds: string[],
    gender?: Gender | null,
  ): Promise<{ hits: ProductResult[]; candidates: CatalogSearchRow[] }> {
    const queryEmbedding = await this.embeddingsService.embed(params.query);
    const poolSize = Math.max(limit * 3, 20);
    const systemUserId = await this.catalogRepository.getOrCreateSystemUserId();

    const candidates = await this.catalogRepository.findSimilar(
      queryEmbedding,
      poolSize,
      systemUserId,
      excludeExternalIds,
      gender,
    );

    // Полная диагностика решения "кэш или WB": сколько вещей вообще в
    // каталоге, и на какой дистанции были ближайшие кандидаты — чтобы по
    // логам сразу было видно, промахивается порог или каталог просто пуст.
    const stats = await this.catalogRepository.getCatalogStats(systemUserId);
    const topDistances = candidates
      .slice(0, 5)
      .map((row) => row.distance.toFixed(4))
      .join(', ');

    this.logger.log(
      `Кэш-поиск "${params.query}": в каталоге ${stats.total} вещей ` +
        `(с embedding: ${stats.withEmbedding}), кандидатов найдено ${candidates.length}, ` +
        `топ дистанций=[${topDistances || '—'}] (порог=${SIMILARITY_DISTANCE_THRESHOLD})`,
    );

    const withinThreshold = candidates.filter(
      (row) => row.distance <= SIMILARITY_DISTANCE_THRESHOLD,
    );

    const priceFiltered = this.filterByPrice(
      withinThreshold,
      params.minPrice,
      params.maxPrice,
    );

    const hits = priceFiltered
      .slice(0, limit)
      .map((row) => this.toProductResult(row));

    return { hits, candidates };
  }

  private filterByPrice(
    rows: CatalogSearchRow[],
    minPrice?: number,
    maxPrice?: number,
  ): CatalogSearchRow[] {
    if (minPrice == null && maxPrice == null) {
      return rows;
    }

    return rows.filter((row) => {
      // Неизвестную цену не отбраковываем — товар может всё равно подойти,
      // просто цену для него уточнит сам пользователь по ссылке.
      if (row.price == null) return true;
      if (minPrice != null && row.price < minPrice) return false;
      if (maxPrice != null && row.price > maxPrice) return false;

      return true;
    });
  }

  private toProductResult(row: CatalogSearchRow): ProductResult {
    return {
      name: row.name ?? row.description ?? 'Без названия',
      description: row.description ?? '—',
      brand: row.brand,
      price: row.price,
      rating: row.rating,
      feedbacks: row.feedbacksCount ?? 0,
      photo: row.imageUrl,
      url: row.sourceUrl ?? '',
    };
  }

  private async cacheResults(
    query: string,
    results: ProductResult[],
  ): Promise<void> {
    let cached = 0;
    let skipped = 0;
    let failed = 0;

    for (const result of results) {
      try {
        const wasCached = await this.cacheOne(result);

        if (wasCached) cached++;
        else skipped++;
      } catch (error) {
        failed++;
        this.logger.warn(
          `Не удалось закэшировать товар "${result.name}" (${result.url}): ${(error as Error).message}`,
        );
      }
    }

    // Итоговая сводка — по ней сразу видно, реально ли что-то пишется в
    // кэш после похода в WB, или запись молча не срабатывает.
    this.logger.log(
      `Кэш-запись по запросу "${query}": сохранено ${cached}, ` +
        `уже было ${skipped}, ошибок ${failed} из ${results.length}`,
    );
  }

  /** @returns true, если товар реально записан в кэш новой строкой */
  private async cacheOne(result: ProductResult): Promise<boolean> {
    const externalId = extractWildberriesId(result.url);

    if (!externalId) {
      this.logger.warn(
        `Не удалось распознать id Wildberries в ссылке "${result.url}" — товар не закэширован`,
      );

      return false;
    }

    const existing = await this.catalogRepository.findByExternalId(externalId);

    if (existing) {
      return false;
    }

    const { category, brand, targetGender } =
      await this.clothesCharacterizerService.classifyCatalogItem({
        title: result.name,
        tags: result.description,
      });

    const embedding = await this.embeddingsService.embed(
      `${result.name}. ${result.description}`,
    );

    const systemUserId = await this.catalogRepository.getOrCreateSystemUserId();

    await this.catalogRepository.insert({
      createdById: systemUserId,
      name: result.name,
      description: result.description,
      brand: result.brand ?? brand,
      category,
      targetGender,
      imageUrl: result.photo,
      sourceUrl: result.url,
      externalId,
      price: result.price,
      rating: result.rating,
      feedbacksCount: result.feedbacks,
      source: ClothesSource.WEB,
      embedding,
    });

    this.logger.debug(
      `Закэширован товар WB id=${externalId}: "${result.name}"`,
    );

    return true;
  }
}
