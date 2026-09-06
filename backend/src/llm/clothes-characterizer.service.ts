import { Inject, Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';
import { z } from 'zod';
import { ClothesCategory, ClothesGender } from '@prisma/client';
import { clothesCategoryLabels } from '@capsule/common';
import {
  OPENROUTER_CHAT_MODEL,
  OPENROUTER_VISION_MODEL,
} from './openrouter.provider';
import { EmbeddingsService } from './embeddings.service';
import { extractLangchainMessageCostUsd } from './openrouter-cost.util';

const clothesCategoryValues = Object.values(ClothesCategory) as [
  ClothesCategory,
  ...ClothesCategory[],
];

// Category enum names don't always match their intended meaning
// (e.g. SWIMWEAR means sportswear, not swimwear — that's SWIMSUIT),
// so the model needs the Russian label, not just the bare enum value.
const categoryLegend = clothesCategoryValues
  .map((category) => `${category} — ${clothesCategoryLabels[category]}`)
  .join(', ');

const categoryFieldDescription = `Наиболее подходящая категория вещи. Значения enum и их реальный смысл: ${categoryLegend}`;

const clothesGenderValues = Object.values(ClothesGender) as [
  ClothesGender,
  ...ClothesGender[],
];

const targetGenderFieldDescription =
  'На кого рассчитана вещь по названию и тегам: MALE — мужская, FEMALE — женская, ' +
  'UNISEX — унисекс или пол не определить по описанию (нейтральные вещи вроде базовых ' +
  'футболок, если явно не указано иное). Ошибка в эту сторону не критична, а вот ' +
  'спутать MALE и FEMALE — критично, будь внимателен к явным маркерам пола в тексте.';

const catalogClassificationSchema = z.object({
  category: z.enum(clothesCategoryValues).describe(categoryFieldDescription),
  brand: z
    .string()
    .nullable()
    .describe(
      'Бренд/магазин вещи, извлечённый из названия, если удалось определить, иначе null',
    ),
  targetGender: z
    .enum(clothesGenderValues)
    .describe(targetGenderFieldDescription),
});

const imageAnalysisSchema = z.object({
  category: z.enum(clothesCategoryValues).describe(categoryFieldDescription),
  brand: z
    .string()
    .nullable()
    .describe(
      'Бренд вещи, только если на фото чётко виден логотип, лейбл или бирка с названием бренда. ' +
        'Не угадывай бренд по фасону или стилю — если не уверен, верни null.',
    ),
  description: z
    .string()
    .describe(
      'Связное описание вещи одним абзацем на русском языке: цвет, материал, силуэт, посадка, стиль, узнаваемые детали',
    ),
});

@Injectable()
export class ClothesCharacterizerService {
  private readonly logger = new Logger(ClothesCharacterizerService.name);

  constructor(
    @Inject(OPENROUTER_VISION_MODEL)
    private readonly visionModel: ChatOpenAI,
    @Inject(OPENROUTER_CHAT_MODEL)
    private readonly chatModel: ChatOpenAI,
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  async analyzeImage(input: {
    imageBuffer: Buffer;
    mimeType: string;
  }): Promise<{
    category: ClothesCategory;
    brand: string | null;
    description: string;
    embedding: number[];
    costUsd: number;
    model: string;
  }> {
    this.logger.debug(
      `analyzeImage() called for mimeType=${input.mimeType} size=${input.imageBuffer.length}`,
    );

    try {
      const analyzer = this.visionModel.withStructuredOutput(
        imageAnalysisSchema,
        { includeRaw: true },
      );

      const { raw, parsed: result } = await analyzer.invoke([
        new HumanMessage({
          content: [
            {
              type: 'text',
              text:
                `Проанализируй фотографию вещи одежды и определи категорию и бренд.\n\n` +
                `Категория — выбери значение enum по его реальному смыслу (в скобках указан ` +
                `смысл, а не буквальный перевод английского названия): ${categoryLegend}.\n\n` +
                `Бренд — верни, только если на фото чётко виден логотип, лейбл или бирка с ` +
                `названием бренда. Не угадывай бренд по фасону или стилю — если не уверен, ` +
                `верни null.\n\n` +
                `Также составь связное описание вещи одним абзацем на русском языке: ` +
                `цвет, материал, силуэт, посадка, стиль, узнаваемые детали.`,
            },
            {
              // withStructuredOutput() doesn't convert the standard
              // { type: 'image', mimeType, data } content block to the
              // provider wire format, so the image silently never reaches
              // the model — use the native OpenAI-compatible shape instead.
              type: 'image_url',
              image_url: {
                url: `data:${input.mimeType};base64,${input.imageBuffer.toString('base64')}`,
              },
            },
          ],
        }),
      ]);

      const costUsd = extractLangchainMessageCostUsd(raw);

      this.logger.debug(
        `analyzeImage() -> category=${result.category} brand="${result.brand}" costUsd=${costUsd}`,
      );

      const embedding = await this.embeddingsService.embed(
        `${result.brand ?? ''}. ${result.category}. ${result.description}`,
      );

      return {
        category: result.category,
        brand: result.brand ?? null,
        description: result.description,
        embedding,
        costUsd,
        model: this.visionModel.model,
      };
    } catch (error) {
      this.logger.error(
        `analyzeImage() failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async classifyCatalogItem(input: { title: string; tags: string }): Promise<{
    category: ClothesCategory;
    brand: string | null;
    targetGender: ClothesGender;
    costUsd: number;
    model: string;
  }> {
    this.logger.debug(
      `classifyCatalogItem() called for title="${input.title}"`,
    );

    try {
      const classifier = this.chatModel.withStructuredOutput(
        catalogClassificationSchema,
        { includeRaw: true },
      );

      const { raw, parsed: result } = await classifier.invoke(
        `Определи категорию, бренд и на кого рассчитана вещь (пол) по названию и ` +
          `тегам товара с маркетплейса.\n` +
          `Название: ${input.title}\n` +
          `Теги: ${input.tags}`,
      );

      const costUsd = extractLangchainMessageCostUsd(raw);

      this.logger.debug(
        `classifyCatalogItem() -> category=${result.category} brand="${result.brand}" ` +
          `targetGender=${result.targetGender} costUsd=${costUsd}`,
      );

      return {
        category: result.category,
        brand: result.brand ?? null,
        targetGender: result.targetGender,
        costUsd,
        model: this.chatModel.model,
      };
    } catch (error) {
      this.logger.error(
        `classifyCatalogItem() failed for title="${input.title}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
