import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { openrouterConfig } from 'src/config/env-config/load-config';
import { costFromRawUsage } from './openrouter-cost.util';

const OPENROUTER_CHAT_COMPLETIONS_URL =
  'https://openrouter.ai/api/v1/chat/completions';

const buildStylizePrompt = (
  itemCount: number,
) => `You are a fashion photographer specializing in flat-lay shoots of capsule wardrobes.
You will be given ${itemCount} images, each showing exactly one clothing item or accessory in isolation.

STRICT RULE — ITEM SET IS CLOSED: use ONLY the items shown in the ${itemCount} provided images, one instance of each. Do not invent, add, duplicate, or substitute ANY clothing item, shoe, bag, or accessory that is not one of the provided images. Never repeat a single item to fill the composition, even if it is the most visually distinct one. The output must show exactly ${itemCount} distinct items, each appearing exactly once — no more, no less.

Compose them into a single professional flat-lay photograph of the capsule:
- keep every item exactly as it appears in its own source image: same color, print, silhouette, and details (pockets, zippers, logos, collar) — do not add, remove, or replace anything;
- arrange the items neatly following outfit logic (tops, bottoms, shoes, accessories), with light tasteful overlap allowed but no chaotic overlap that hides important details;
- use a clean, neutral, light background (studio fabric), with no extraneous objects, text, or watermarks;
- lighting must be unified and soft, with consistent gentle shadows under each item, as if shot in a single session;
- keep the relative scale between items realistic;
- no people, mannequins, hands, or body parts in the frame — only the items themselves.

Before finishing, count the items in your output: it must exactly equal ${itemCount}, with no item repeated and no item missing.

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
export class CapsuleStylistService {
  private readonly logger = new Logger(CapsuleStylistService.name);

  constructor(
    @Inject(openrouterConfig.KEY)
    private readonly config: ConfigType<typeof openrouterConfig>,
  ) {}

  async stylize(itemImageUrls: string[]): Promise<{
    buffer: Buffer;
    mimetype: string;
    costUsd: number;
    model: string;
  }> {
    this.logger.debug(
      `stylize() called via model=${this.config.imageModel}, itemCount=${itemImageUrls.length}`,
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
                text: buildStylizePrompt(itemImageUrls.length),
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
