# WB Search MCP для NestJS

MCP-инструмент `search_products` для поиска товаров на Wildberries,
встроенный прямо в NestJS-приложение. AI-хост (Claude Desktop, Cursor,
Claude Code) подключается к эндпоинту `/mcp` по Streamable HTTP и может
вызывать поиск как инструмент.

Токен Wildberries **не нужен** — используется публичный поисковый API.

## Что внутри

```
src/
├── wildberries/
│   ├── wildberries.service.ts   # запрос к API WB, парсинг, фильтр по цене, фото
│   └── wildberries.module.ts
├── mcp/
│   ├── mcp-server.factory.ts    # создаёт McpServer и регистрирует инструмент
│   ├── mcp.controller.ts        # эндпоинт /mcp (Streamable HTTP, stateless)
│   └── mcp.module.ts
├── app.module.ts                # пример корневого модуля
└── main.ts                      # точка входа + настройка парсинга тела
```

---

## Установка в СВОЙ проект

1. Скопируй папки `src/wildberries` и `src/mcp` в свой `src/`.

2. Поставь зависимости:

```bash
npm install @modelcontextprotocol/sdk zod
```
(`@nestjs/*`, `express` у тебя уже есть.)

3. Подключи `McpModule` в своём `AppModule`:

```ts
import { McpModule } from './mcp/mcp.module';

@Module({
  imports: [
    // ...твои модули
    McpModule,
  ],
})
export class AppModule {}
```

4. **Важно — парсинг тела.** Streamable HTTP транспорт сам читает тело
   запроса на `/mcp`, поэтому глобальный `express.json()` там мешает.
   В своём `main.ts` исключи `/mcp` из JSON-парсера (см. пример в `main.ts`):

```ts
app.use((req, res, next) => {
  if (req.path.startsWith('/mcp')) return next();
  return json()(req, res, next);
});
```
Если у тебя body-парсер настроен иначе — просто убедись, что на `/mcp`
он **не** применяется.

5. Запусти приложение. Эндпоинт будет на `http://localhost:3000/mcp`.

---

## Подключение AI-хоста

### Claude Desktop / Cursor

В конфиге MCP укажи HTTP-транспорт:

```json
{
  "mcpServers": {
    "wb-search": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

Затем можно просить:
> «Найди на WB рюкзаки для ноутбука до 3000 рублей»

### Быстрая проверка через curl

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc":"2.0","id":1,"method":"tools/call",
    "params":{
      "name":"search_products",
      "arguments":{"query":"наушники","maxPrice":3000,"limit":3}
    }
  }'
```

---

## Инструмент search_products

| Параметр   | Тип     | Описание                                                  |
|------------|---------|-----------------------------------------------------------|
| `query`    | string  | поисковый запрос (обязательный)                           |
| `minPrice` | number  | минимальная цена, ₽                                       |
| `maxPrice` | number  | максимальная цена, ₽                                      |
| `limit`    | number  | сколько вернуть (1–100, по умолчанию 10)                  |
| `sort`     | enum    | `popular` / `priceup` / `pricedown` / `rate` / `newly`   |

Ответ по каждому товару: `name`, `description` (бренд + категория),
`price`, `rating`, `feedbacks`, `photo` (ссылка на фото), `url`.

---

## Важные замечания

**API неофициальный.** Публичный поисковый эндпоинт WB
(`search.wb.ru/.../v5/search`) не документирован и может меняться:
домены, версия (`v5` → `v6`), поля цены (`salePriceU` / `priceU` /
`sizes[].price.product` — код пробует все), диапазоны корзин для фото.
Если что-то сломалось — сверь реальный ответ через curl и поправь
`wildberries.service.ts`.

**Безопасность (CVE-2026-25536).** MCP-сервер и транспорт создаются
заново на КАЖДЫЙ запрос и уничтожаются после (`res.on('close', ...)`).
Это защита от утечки данных между клиентами — не переделывай на один
общий инстанс.

**Версия SDK.** Используется MCP TypeScript SDK v1 (`@modelcontextprotocol/sdk`)
— стабильная линейка с большим количеством примеров. Летом 2026 вышел v2
(`@modelcontextprotocol/server`) с новым stateless-протоколом; при желании
можно мигрировать, но для встраивания в Nest v1 проще и надёжнее.

**Блокировки.** При частых запросах WB может отдавать капчу или
ограничивать IP. Для личного использования обычно не проблема; под
нагрузкой понадобятся задержки/прокси.

## Дисклеймер

Скрейпинг публичных данных для личного использования. Массовый сбор и
коммерческое использование могут нарушать условия Wildberries. Проект
неофициальный, с Wildberries не связан.
