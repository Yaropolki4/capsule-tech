import { Module } from '@nestjs/common';
import {
  openrouterChatModelProvider,
  openrouterVisionModelProvider,
  OPENROUTER_CHAT_MODEL,
  OPENROUTER_VISION_MODEL,
} from './openrouter.provider';
import { EmbeddingsService } from './embeddings.service';
import { ClothesCharacterizerService } from './clothes-characterizer.service';
import { CapsuleStylistService } from './capsule-stylist.service';
import { TryOnStylistService } from './try-on-stylist.service';

@Module({
  providers: [
    openrouterChatModelProvider,
    openrouterVisionModelProvider,
    EmbeddingsService,
    ClothesCharacterizerService,
    CapsuleStylistService,
    TryOnStylistService,
  ],
  exports: [
    OPENROUTER_CHAT_MODEL,
    OPENROUTER_VISION_MODEL,
    EmbeddingsService,
    ClothesCharacterizerService,
    CapsuleStylistService,
    TryOnStylistService,
  ],
})
export class LlmModule {}
