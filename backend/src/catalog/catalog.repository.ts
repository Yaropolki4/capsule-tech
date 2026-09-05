import { Inject, Injectable } from '@nestjs/common';
import { ClothesCategory, ClothesSource, Prisma } from '@prisma/client';
import {
  SECURE_PRISMA_SERVICE,
  SecurePrismaService,
} from 'src/prisma/prisma.service';

export const CATALOG_SYSTEM_USER_NAME = 'wb-catalog';
const CATALOG_SYSTEM_USER_EMAIL = 'wb-catalog@system.capsule.local';
const CATALOG_SYSTEM_USER_FULL_NAME = 'Каталог Wildberries';

export interface CatalogSearchRow {
  id: string;
  name: string | null;
  description: string | null;
  brand: string | null;
  price: number | null;
  rating: number | null;
  feedbacksCount: number | null;
  imageUrl: string;
  sourceUrl: string | null;
  distance: number;
}

export interface CatalogItemInput {
  createdById: string;
  name: string;
  description: string | null;
  brand: string | null;
  category: ClothesCategory;
  imageUrl: string;
  sourceUrl: string;
  externalId: string;
  generationPrompt?: string;
  price: number | null;
  rating: number | null;
  feedbacksCount: number | null;
  source: ClothesSource;
  embedding: number[];
}

/**
 * Хранилище для общего каталога вещей (не привязан к гардеробу конкретного
 * пользователя): пресеты из clothes.json (source=CATALOG) и результаты
 * поиска Wildberries, закэшированные для переиспользования (source=WEB).
 * Использует ту же таблицу `clothes`, что и личный гардероб, но без записи
 * в user_clothes — это не чей-то гардероб, а общий переиспользуемый пул.
 */
@Injectable()
export class CatalogRepository {
  private cachedSystemUserId: string | null = null;

  constructor(
    @Inject(SECURE_PRISMA_SERVICE) private readonly prisma: SecurePrismaService,
  ) {}

  /**
   * Ближайшие по эмбеддингу вещи среди CATALOG/WEB источников, отсортированы
   * по возрастанию косинусной дистанции (0 — идентично). Ограничено вещами
   * служебного каталожного пользователя: WEB-вещи, которые реальный
   * пользователь сам импортировал себе в гардероб (createFromWildberries),
   * принадлежат ему и не должны утекать в чужие результаты поиска.
   *
   * excludeExternalIds — id вещей с Wildberries, уже показанных пользователю
   * в этом треде (см. CatalogService/ChatService) — чтобы "покажи другие
   * шорты" реально давало другие вещи, а не тот же топ по близости.
   */
  async findSimilar(
    embedding: number[],
    poolSize: number,
    systemUserId: string,
    excludeExternalIds: string[] = [],
  ): Promise<CatalogSearchRow[]> {
    const vectorLiteral = `[${embedding.join(',')}]`;

    return this.prisma.$queryRaw<CatalogSearchRow[]>`
      SELECT
        id,
        name,
        description,
        brand,
        price,
        rating,
        feedbacks_count AS "feedbacksCount",
        "imageUrl",
        source_url AS "sourceUrl",
        (embedding <=> ${vectorLiteral}::vector) AS distance
      FROM clothes
      WHERE source IN ('CATALOG', 'WEB')
        AND "createdById" = ${systemUserId}
        AND embedding IS NOT NULL
        AND NOT (external_id = ANY(${excludeExternalIds}::text[]))
      ORDER BY embedding <=> ${vectorLiteral}::vector
      LIMIT ${poolSize}
    `;
  }

  findByExternalId(externalId: string) {
    return this.prisma.clothes.findUnique({ where: { externalId } });
  }

  /**
   * Диагностика для логов: сколько вещей вообще есть в каталоге у
   * служебного пользователя и у скольких из них реально посчитан embedding
   * (без него строка не участвует в поиске findSimilar).
   */
  async getCatalogStats(
    systemUserId: string,
  ): Promise<{ total: number; withEmbedding: number }> {
    const rows = await this.prisma.$queryRaw<
      { total: bigint; withEmbedding: bigint }[]
    >`
      SELECT
        COUNT(*)::bigint AS total,
        COUNT(embedding)::bigint AS "withEmbedding"
      FROM clothes
      WHERE "createdById" = ${systemUserId}
        AND source IN ('CATALOG', 'WEB')
    `;

    const row = rows[0];

    return {
      total: Number(row?.total ?? 0),
      withEmbedding: Number(row?.withEmbedding ?? 0),
    };
  }

  async insert(data: CatalogItemInput) {
    return this.prisma.$transaction(async (tx) => {
      const record = await tx.clothes.create({
        data: {
          createdById: data.createdById,
          name: data.name,
          description: data.description,
          brand: data.brand,
          category: data.category,
          imageUrl: data.imageUrl,
          sourceUrl: data.sourceUrl,
          externalId: data.externalId,
          generationPrompt: data.generationPrompt,
          price: data.price,
          rating: data.rating,
          feedbacksCount: data.feedbacksCount,
          source: data.source,
        },
      });

      const vectorLiteral = `[${data.embedding.join(',')}]`;

      await tx.$executeRaw`
        UPDATE clothes SET embedding = ${vectorLiteral}::vector WHERE id = ${record.id}
      `;

      return record;
    });
  }

  /**
   * Каталожные вещи (CATALOG/WEB) не принадлежат никому лично, но
   * createdById обязателен в схеме — заводим одного служебного пользователя
   * и переиспользуем его id для всех таких записей.
   */
  async getOrCreateSystemUserId(): Promise<string> {
    if (this.cachedSystemUserId) {
      return this.cachedSystemUserId;
    }

    const existing = await this.prisma.user.findUnique({
      where: { name: CATALOG_SYSTEM_USER_NAME },
    });

    if (existing) {
      this.cachedSystemUserId = existing.id;

      return existing.id;
    }

    try {
      const created = await this.prisma.user.create({
        data: {
          name: CATALOG_SYSTEM_USER_NAME,
          email: CATALOG_SYSTEM_USER_EMAIL,
          fullName: CATALOG_SYSTEM_USER_FULL_NAME,
          password: null,
        },
      });

      this.cachedSystemUserId = created.id;

      return created.id;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const racedUser = await this.prisma.user.findUnique({
          where: { name: CATALOG_SYSTEM_USER_NAME },
        });

        if (racedUser) {
          this.cachedSystemUserId = racedUser.id;

          return racedUser.id;
        }
      }

      throw error;
    }
  }
}
