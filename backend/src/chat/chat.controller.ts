import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ChatMessageRole, ChatThread } from '@prisma/client';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { ZodValidationPipe } from 'src/shared/validation/zod-validation.pipe';
import {
  sendMessageRequestDtoSchema,
  SendMessageRequestDto,
  GetThreadMessagesResponseDto,
  CreateThreadResponseDto,
  GetThreadsResponseDto,
  ChatThreadSummaryDto,
  ChatMessageDto,
  ChatStreamEventDto,
} from '@capsule/common';
import { AccessTokenPayload } from 'src/auth/types/access-token-payload';
import {
  ChatService,
  ChatStreamEvent,
  EnrichedChatMessage,
} from './chat.service';

function toChatMessageDto(message: EnrichedChatMessage): ChatMessageDto {
  return {
    id: message.id,
    role: message.role === ChatMessageRole.USER ? 'user' : 'assistant',
    text: message.text,
    suggestions: message.suggestions.length ? message.suggestions : undefined,
    wildberriesSuggestions: message.wildberriesSuggestions.length
      ? message.wildberriesSuggestions
      : undefined,
    capsuleConcepts: message.capsuleConcepts.length
      ? message.capsuleConcepts
      : undefined,
    capsuleProposal: message.capsuleProposal ?? undefined,
  };
}

function toChatStreamEventDto(event: ChatStreamEvent): ChatStreamEventDto {
  switch (event.type) {
    case 'user_message':
    case 'assistant_message':
      return { type: event.type, message: toChatMessageDto(event.message) };
    case 'tool_start':
      return { type: 'tool_start', tool: event.tool, input: event.input };
    case 'tool_end':
      return { type: 'tool_end', tool: event.tool, source: event.source };
    case 'error':
      return { type: 'error', message: event.message };
    case 'drift_warning':
      return { type: 'drift_warning', message: event.message };
  }
}

function toChatThreadSummaryDto(thread: ChatThread): ChatThreadSummaryDto {
  return {
    id: thread.id,
    title: thread.title,
    createdAt: thread.createdAt.toISOString(),
    updatedAt: thread.updatedAt.toISOString(),
  };
}

@Controller('chat')
@UseGuards(JwtGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('threads')
  async createThread(@Req() req: Request): Promise<CreateThreadResponseDto> {
    const user = req.user as AccessTokenPayload;
    const thread = await this.chatService.createThread(user.id);

    return { id: thread.id };
  }

  @Get('threads')
  async listThreads(@Req() req: Request): Promise<GetThreadsResponseDto> {
    const user = req.user as AccessTokenPayload;
    const threads = await this.chatService.listThreads(user.id);

    return { items: threads.map(toChatThreadSummaryDto) };
  }

  @Get('threads/:id/messages')
  async getMessages(
    @Param('id') threadId: string,
    @Req() req: Request,
  ): Promise<GetThreadMessagesResponseDto> {
    const user = req.user as AccessTokenPayload;
    const messages = await this.chatService.getMessages(threadId, user.id);

    return messages.map(toChatMessageDto);
  }

  /**
   * Стримит ответ построчным NDJSON (ChatStreamEventDto на строку), а не
   * единым JSON-объектом — это позволяет показывать текст ответа и статус
   * инструментов ("ищу в сохранённых...", "иду на Wildberries...") в чате
   * по мере того, как агент их производит, а не только после того, как весь
   * ход целиком завершится.
   */
  @Post('threads/:id/messages')
  async sendMessage(
    @Param('id') threadId: string,
    @Body(new ZodValidationPipe(sendMessageRequestDtoSchema))
    { text }: SendMessageRequestDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const user = req.user as AccessTokenPayload;

    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    // На случай прокси (nginx и т.п.) перед бэкендом — чтобы не буферизовал
    // весь ответ целиком перед отдачей клиенту.
    res.setHeader('X-Accel-Buffering', 'no');

    try {
      for await (const event of this.chatService.sendMessage(
        threadId,
        user.id,
        text,
      )) {
        res.write(`${JSON.stringify(toChatStreamEventDto(event))}\n`);
      }
    } catch {
      // sendMessage() сам ловит ошибки агента и шлёт событие type: 'error' —
      // сюда попадают только неожиданные сбои до начала стрима (например,
      // тред не найден).
      const errorEvent: ChatStreamEventDto = {
        type: 'error',
        message: 'Что-то пошло не так, попробуй ещё раз',
      };

      res.write(`${JSON.stringify(errorEvent)}\n`);
    } finally {
      res.end();
    }
  }
}
