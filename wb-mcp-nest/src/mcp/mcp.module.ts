import { Module } from '@nestjs/common';
import { McpController } from './mcp.controller';
import { McpServerFactory } from './mcp-server.factory';
import { WildberriesModule } from '../wildberries/wildberries.module';

@Module({
  imports: [WildberriesModule],
  controllers: [McpController],
  providers: [McpServerFactory],
})
export class McpModule {}
