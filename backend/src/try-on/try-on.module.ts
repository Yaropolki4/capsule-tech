import { Module } from '@nestjs/common';
import { TryOnService } from './try-on.service';
import { TryOnController } from './try-on.controller';
import { TryOnRepository } from './try-on.repository';
import { S3Module } from 'src/s3/s3.module';
import { LlmModule } from 'src/llm/llm.module';
import { BillingModule } from 'src/billing/billing.module';

@Module({
  controllers: [TryOnController],
  providers: [TryOnService, TryOnRepository],
  imports: [S3Module, LlmModule, BillingModule],
})
export class TryOnModule {}
