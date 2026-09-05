/**
 * Заполняет общий каталог (таблица clothes, source=CATALOG) пресетами из
 * clothes.json в корне проекта. Идемпотентен — уже засеянные по externalId
 * вещи пропускаются, так что скрипт safe перезапускать.
 *
 * Запуск: pnpm run seed:catalog (из backend/), нужен поднятый Postgres и
 * валидный OPENROUTER_API_KEY в backend/.env (классификация + эмбеддинги).
 */
import 'reflect-metadata';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ClothesSource } from '@prisma/client';
import { PrismaModule } from '../src/prisma/prisma.module';
import { CatalogModule } from '../src/catalog/catalog.module';
import { openrouterConfig } from '../src/config/env-config/load-config';
import { envSchema } from '../src/config/env-config/env-schema';
import { CatalogRepository } from '../src/catalog/catalog.repository';
import { extractWildberriesId } from '../src/catalog/catalog.service';
import { EmbeddingsService } from '../src/llm/embeddings.service';
import { ClothesCharacterizerService } from '../src/llm/clothes-characterizer.service';

// Отдельный минимальный модуль вместо всего AppModule: сиду не нужны
// ClothesModule/S3Module/AuthModule и т.д., а у ClothesModule есть gRPC-клиент
// с относительным путём до .proto-файла, рассчитанным на структуру
// собранного dist/ — при запуске через ts-node (без сборки) __dirname на
// уровень мельче, путь резолвится не туда и модуль падает при старте.
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [openrouterConfig],
      validate: (config) => envSchema.parse(config),
    }),
    PrismaModule,
    CatalogModule,
  ],
})
class SeedAppModule {}

interface ClothesPreset {
  id: number;
  title: string;
  tags: string;
  link: string;
  image: string;
  generation_prompt?: string;
}

const CLOTHES_JSON_PATH = join(__dirname, '../../clothes.json');
const DELAY_BETWEEN_ITEMS_MS = 200;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function seedOne(
  preset: ClothesPreset,
  deps: {
    catalogRepository: CatalogRepository;
    embeddingsService: EmbeddingsService;
    clothesCharacterizerService: ClothesCharacterizerService;
    systemUserId: string;
  },
): Promise<'inserted' | 'skipped'> {
  const externalId = extractWildberriesId(preset.link);

  if (!externalId) {
    throw new Error(
      `Не удалось извлечь id Wildberries из ссылки: ${preset.link}`,
    );
  }

  const existing = await deps.catalogRepository.findByExternalId(externalId);

  if (existing) {
    return 'skipped';
  }

  const { category, brand } =
    await deps.clothesCharacterizerService.classifyCatalogItem({
      title: preset.title,
      tags: preset.tags,
    });

  const embedding = await deps.embeddingsService.embed(
    `${preset.title}. ${preset.tags}`,
  );

  await deps.catalogRepository.insert({
    createdById: deps.systemUserId,
    name: preset.title,
    description: preset.tags,
    brand,
    category,
    imageUrl: preset.image,
    sourceUrl: preset.link,
    externalId,
    generationPrompt: preset.generation_prompt,
    price: null,
    rating: null,
    feedbacksCount: null,
    source: ClothesSource.CATALOG,
    embedding,
  });

  return 'inserted';
}

async function main() {
  const presets = JSON.parse(
    readFileSync(CLOTHES_JSON_PATH, 'utf-8'),
  ) as ClothesPreset[];

  console.log(`Загружено ${presets.length} пресетов из ${CLOTHES_JSON_PATH}`);

  const app = await NestFactory.createApplicationContext(SeedAppModule, {
    logger: ['warn', 'error'],
  });

  const catalogRepository = app.get(CatalogRepository);
  const embeddingsService = app.get(EmbeddingsService);
  const clothesCharacterizerService = app.get(ClothesCharacterizerService);
  const systemUserId = await catalogRepository.getOrCreateSystemUserId();

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const [index, preset] of presets.entries()) {
    const progress = `[${index + 1}/${presets.length}]`;

    try {
      const outcome = await seedOne(preset, {
        catalogRepository,
        embeddingsService,
        clothesCharacterizerService,
        systemUserId,
      });

      if (outcome === 'inserted') {
        inserted++;
        console.log(`${progress} добавлено: "${preset.title}"`);
      } else {
        skipped++;
        console.log(`${progress} уже есть, пропущено: "${preset.title}"`);
      }
    } catch (error) {
      failed++;
      console.error(
        `${progress} ошибка на "${preset.title}": ${(error as Error).message}`,
      );
    }

    await sleep(DELAY_BETWEEN_ITEMS_MS);
  }

  console.log(
    `\nГотово: добавлено ${inserted}, пропущено ${skipped}, ошибок ${failed} из ${presets.length}`,
  );

  await app.close();
}

main().catch((error) => {
  console.error('Сид каталога упал:', error);
  process.exit(1);
});
