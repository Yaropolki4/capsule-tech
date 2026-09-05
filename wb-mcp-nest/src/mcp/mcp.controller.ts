import { All, Controller, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { McpServerFactory } from './mcp-server.factory';

/**
 * Единый эндпоинт /mcp, к которому подключается AI-хост
 * (Claude Desktop, Cursor, Claude Code и т.п.) по Streamable HTTP.
 *
 * Работаем в STATELESS-режиме: на каждый запрос создаём новый
 * McpServer + новый транспорт и уничтожаем их после ответа.
 * Это и есть рекомендованная защита от CVE-2026-25536
 * (утечка данных между клиентами при переиспользовании инстансов).
 */
@Controller('mcp')
export class McpController {
  constructor(private readonly factory: McpServerFactory) {}

  @All()
  async handle(@Req() req: Request, @Res() res: Response) {
    const server = this.factory.create();
    const transport = new StreamableHTTPServerTransport({
      // stateless: без сессий и хранимого состояния между запросами
      sessionIdGenerator: undefined,
    });

    // Освобождаем ресурсы, когда клиент закрыл соединение.
    res.on('close', () => {
      transport.close();
      server.close();
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null,
        });
      }
    }
  }
}
