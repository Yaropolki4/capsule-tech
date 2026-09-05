import { Module } from '@nestjs/common';
import { ClothesService } from './clothes.service';
import { ClothesController } from './clothes.controller';
import { S3Module } from 'src/s3/s3.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { ClothesRepository } from './clothes.repository';
import { LlmModule } from 'src/llm/llm.module';
import { BillingModule } from 'src/billing/billing.module';

@Module({
  controllers: [ClothesController],
  providers: [ClothesService, ClothesRepository],
  imports: [AuthModule, S3Module, UserModule, LlmModule, BillingModule],
  exports: [ClothesRepository],
})
export class ClothesModule {}
