/**
 * Разово проставляет targetGender у уже засеянных вещей каталога/WEB-кэша
 * (source=CATALOG|WEB), у которых поле ещё null — то есть у всего, что
 * попало в базу до введения поля. Определяет пол по name/description
 * (то же title/tags, что и при первичной классификации), без картинки.
 * Идемпотентен — обрабатывает только строки с targetGender IS NULL, так что
 * safe перезапускать, если прервался на середине.
 *
 * Запуск: pnpm run backfill:clothes-gender (из backend/), нужен поднятый
 * Postgres и валидный OPENROUTER_API_KEY в backend/.env.
 */
import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { PrismaModule } from '../src/prisma/prisma.module';
import { CatalogModule } from '../src/catalog/catalog.module';
import { openrouterConfig } from '../src/config/env-config/load-config';
import { envSchema } from '../src/config/env-config/env-schema';
import { CatalogRepository } from '../src/catalog/catalog.repository';
import { ClothesCharacterizerService } from '../src/llm/clothes-characterizer.service';

// См. seed-catalog.ts — та же причина держать отдельный минимальный модуль
// вместо AppModule целиком.
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
class BackfillAppModule {}

const DELAY_BETWEEN_ITEMS_MS = 200;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const app = await NestFactory.createApplicationContext(BackfillAppModule, {
    logger: ['warn', 'error'],
  });

  const catalogRepository = app.get(CatalogRepository);
  const clothesCharacterizerService = app.get(ClothesCharacterizerService);

  const items = await catalogRepository.findMissingTargetGender();

  console.log(`Найдено ${items.length} вещей без targetGender`);

  let updated = 0;
  let failed = 0;

  for (const [index, item] of items.entries()) {
    const progress = `[${index + 1}/${items.length}]`;
    const title = item.name ?? '';
    const tags = item.description ?? '';

    try {
      const { targetGender } =
        await clothesCharacterizerService.classifyCatalogItem({
          title,
          tags,
        });

      await catalogRepository.updateTargetGender(item.id, targetGender);
      updated++;
      console.log(`${progress} "${title}" -> ${targetGender}`);
    } catch (error) {
      failed++;
      console.error(
        `${progress} ошибка на "${title}": ${(error as Error).message}`,
      );
    }

    await sleep(DELAY_BETWEEN_ITEMS_MS);
  }

  console.log(
    `\nГотово: обновлено ${updated}, ошибок ${failed} из ${items.length}`,
  );

  await app.close();
}

main().catch((error) => {
  console.error('Бэкфилл пола каталога упал:', error);
  process.exit(1);
});
