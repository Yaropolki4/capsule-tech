import { Module } from '@nestjs/common';
import { CapsuleService } from './capsule.service';
import { CapsuleController } from './capsule.controller';
import { CapsuleRepository } from './capsule.repository';
import { S3Module } from 'src/s3/s3.module';
import { LlmModule } from 'src/llm/llm.module';
import { BillingModule } from 'src/billing/billing.module';

@Module({
  controllers: [CapsuleController],
  providers: [CapsuleService, CapsuleRepository],
  imports: [S3Module, LlmModule, BillingModule],
})
export class CapsuleModule {}
