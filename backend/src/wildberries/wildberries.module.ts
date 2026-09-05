import { Module } from '@nestjs/common';
import { WildberriesService } from './wildberries.service';

@Module({
  providers: [WildberriesService],
  exports: [WildberriesService],
})
export class WildberriesModule {}
