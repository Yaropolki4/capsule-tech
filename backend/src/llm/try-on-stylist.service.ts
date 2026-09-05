import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { openrouterConfig } from 'src/config/env-config/load-config';
import { costFromRawUsage } from './openrouter-cost.util';

const OPENROUTER_CHAT_COMPLETIONS_URL =
  'https://openrouter.ai/api/v1/chat/completions';

const buildTryOnPrompt = (
  itemCount: number,
) => `You are a virtual try-on photo editor.
You will be given ${itemCount + 1} images: the FIRST image shows a real person (their photo), and the following ${itemCount} image(s) each show exactly one clothing item or accessory in isolation.

STRICT RULE — PRESERVE THE PERSON: keep the person's face, body shape, pose, skin tone, hair, and the original background from the first image completely unchanged and recognizable. Do not alter their identity in any way.

STRICT RULE — PRESERVE THE ITEM(S): render each provided item exactly as it appears in its own source image — same color, print, silhouette, and details (pockets, zippers, logos, collar). Do not invent, add, or substitute any item, color, or pattern that is not shown in the provided item image(s).

Task: realistically dress the person from the first image in the provided item(s), replacing only the relevant clothing region(s) on their body, so it looks like a single, natural, photorealistic photo of that person wearing those item(s). Lighting and shadows on the item(s) must match the original photo's lighting.

Return only the final image, no text.`;

interface OpenRouterImageResponse {
  choices?: {
    message?: {
      images?: { image_url?: { url?: string } }[];
    };
  }[];
  usage?: { cost?: number };
}

@Injectable()
export class TryOnStylistService {
  private readonly logger = new Logger(TryOnStylistService.name);

  constructor(
    @Inject(openrouterConfig.KEY)
    private readonly config: ConfigType<typeof openrouterConfig>,
  ) {}

  async tryOn(
    personImageUrl: string,
    itemImageUrls: string[],
  ): Promise<{
    buffer: Buffer;
    mimetype: string;
    costUsd: number;
    model: string;
  }> {
    this.logger.debug(
      `tryOn() called via model=${this.config.imageModel}, itemCount=${itemImageUrls.length}`,
    );

    const response = await fetch(OPENROUTER_CHAT_COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.imageModel,
        modalities: ['image', 'text'],
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: buildTryOnPrompt(itemImageUrls.length),
              },
              {
                type: 'image_url' as const,
                image_url: { url: personImageUrl },
              },
              ...itemImageUrls.map((url) => ({
                type: 'image_url' as const,
                image_url: { url },
              })),
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();

      this.logger.error(
        `OpenRouter image request failed (${response.status}): ${body}`,
      );

      throw new Error(`OpenRouter image request failed (${response.status})`);
    }

    const payload = (await response.json()) as OpenRouterImageResponse;
    const resultDataUrl =
      payload.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!resultDataUrl) {
      this.logger.error(
        `OpenRouter image response had no image: ${JSON.stringify(payload)}`,
      );

      throw new Error('OpenRouter image response had no image data');
    }

    const match = /^data:(.+);base64,(.+)$/.exec(resultDataUrl);

    if (!match) {
      this.logger.error(
        `OpenRouter image response had an unexpected image url format`,
      );

      throw new Error('OpenRouter image response had an unexpected format');
    }

    const [, resultMimetype, base64] = match;

    return {
      buffer: Buffer.from(base64, 'base64'),
      mimetype: resultMimetype,
      costUsd: costFromRawUsage(payload),
      model: this.config.imageModel,
    };
  }
}
