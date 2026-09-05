import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { ClothesModule } from 'src/clothes/clothes.module';
import { LlmModule } from 'src/llm/llm.module';
import { CatalogModule } from 'src/catalog/catalog.module';
import { UserModule } from 'src/user/user.module';
import { BillingModule } from 'src/billing/billing.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatRepository } from './chat.repository';
import { CapsuleAgentService } from './capsule-agent/capsule-agent.service';
import { ThreadTitleService } from './thread-title/thread-title.service';
import { TopicDriftService } from './topic-drift/topic-drift.service';

@Module({
  imports: [
    AuthModule,
    ClothesModule,
    LlmModule,
    CatalogModule,
    UserModule,
    BillingModule,
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatRepository,
    CapsuleAgentService,
    ThreadTitleService,
    TopicDriftService,
  ],
})
export class ChatModule {}
