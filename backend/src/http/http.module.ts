import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HttpClientService } from './http-client.service';
import { ConfigModule } from '@nestjs/config';
import { cropServerUrlConfig } from 'src/config/env-config/load-config';

@Module({
  imports: [HttpModule, ConfigModule.forFeature(cropServerUrlConfig)],
  providers: [HttpClientService],
  exports: [HttpClientService],
})
export class HttpClientModule {}
