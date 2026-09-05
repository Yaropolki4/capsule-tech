import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ВАЖНО: Streamable HTTP транспорт MCP сам разбирает тело запроса
  // для эндпоинта /mcp, поэтому глобальный JSON-парсер там мешает.
  // Оставляем express.json() для всего приложения, КРОМЕ /mcp.
  app.use((req: any, res: any, next: any) => {
    if (req.path.startsWith('/mcp')) return next();
    return json()(req, res, next);
  });

  await app.listen(3000);
  console.log('Сервер запущен: http://localhost:3000');
  console.log('MCP эндпоинт:   http://localhost:3000/mcp');
}
bootstrap();
