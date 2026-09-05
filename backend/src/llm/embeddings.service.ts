import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { openrouterConfig } from 'src/config/env-config/load-config';

const OPENROUTER_EMBEDDINGS_URL = 'https://openrouter.ai/api/v1/embeddings';

@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);

  constructor(
    @Inject(openrouterConfig.KEY)
    private readonly config: ConfigType<typeof openrouterConfig>,
  ) {}

  async embed(text: string): Promise<number[]> {
    this.logger.debug(
      `Requesting embedding via ${this.config.embeddingModel} (dimensions=${this.config.embeddingDimensions}) for text: "${text.slice(0, 120)}${text.length > 120 ? '…' : ''}"`,
    );

    const response = await fetch(OPENROUTER_EMBEDDINGS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.embeddingModel,
        input: text,
        dimensions: this.config.embeddingDimensions,
      }),
    });

    if (!response.ok) {
      const body = await response.text();

      this.logger.error(
        `OpenRouter embeddings request failed (${response.status}): ${body}`,
      );

      throw new Error(
        `OpenRouter embeddings request failed (${response.status}): ${body}`,
      );
    }

    const payload = (await response.json()) as {
      data: { embedding: number[] }[];
    };

    if (!payload.data?.[0]?.embedding) {
      this.logger.error(
        `OpenRouter embeddings response missing data[0].embedding: ${JSON.stringify(payload)}`,
      );

      throw new Error('OpenRouter embeddings response had no embedding data');
    }

    return payload.data[0].embedding;
  }

  toSqlVector(embedding: number[]): string {
    return `[${embedding.join(',')}]`;
  }
}
