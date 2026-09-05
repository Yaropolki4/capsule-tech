import { Module } from '@nestjs/common';
import { WildberriesModule } from 'src/wildberries/wildberries.module';
import { LlmModule } from 'src/llm/llm.module';
import { CatalogService } from './catalog.service';
import { CatalogRepository } from './catalog.repository';

@Module({
  imports: [WildberriesModule, LlmModule],
  providers: [CatalogService, CatalogRepository],
  exports: [CatalogService, CatalogRepository],
})
export class CatalogModule {}
