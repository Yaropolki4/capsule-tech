import { Module } from '@nestjs/common';
import { McpModule } from './mcp/mcp.module';

/**
 * Пример корневого модуля. В своём проекте просто добавь
 * McpModule в imports существующего AppModule.
 */
@Module({
  imports: [McpModule],
})
export class AppModule {}
