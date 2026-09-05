import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ChatMessageRole } from '@prisma/client';
import {
  SECURE_PRISMA_SERVICE,
  SecurePrismaService,
} from 'src/prisma/prisma.service';

@Injectable()
export class ChatRepository {
  constructor(
    @Inject(SECURE_PRISMA_SERVICE) private readonly prisma: SecurePrismaService,
  ) {}

  createThread(userId: string) {
    return this.prisma.chatThread.create({ data: { userId } });
  }

  listThreadsForUser(userId: string) {
    return this.prisma.chatThread.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  setThreadTitle(threadId: string, title: string) {
    return this.prisma.chatThread.update({
      where: { id: threadId },
      data: { title },
    });
  }

  async getThreadForUser(threadId: string, userId: string) {
    const thread = await this.prisma.chatThread.findUnique({
      where: { id: threadId },
    });

    if (!thread || thread.userId !== userId) {
      throw new NotFoundException('Тред не найден');
    }

    return thread;
  }

  getMessages(threadId: string) {
    return this.prisma.chatMessage.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addMessage(input: {
    threadId: string;
    role: ChatMessageRole;
    text: string;
    suggestionClothesIds?: string[];
    suggestionWildberriesItems?: object[];
    capsuleConcepts?: object[];
    capsuleProposal?: object | null;
  }) {
    const [message] = await this.prisma.$transaction([
      this.prisma.chatMessage.create({
        data: {
          threadId: input.threadId,
          role: input.role,
          text: input.text,
          suggestionClothesIds: input.suggestionClothesIds ?? [],
          suggestionWildberriesItems: input.suggestionWildberriesItems ?? [],
          capsuleConcepts: input.capsuleConcepts ?? [],
          capsuleProposal: input.capsuleProposal ?? undefined,
        },
      }),
      // Пустой update — только чтобы триггернуть @updatedAt на ChatThread:
      // список тредов сортируется по updatedAt, а создание ChatMessage само
      // по себе строку ChatThread не трогает.
      this.prisma.chatThread.update({
        where: { id: input.threadId },
        data: {},
      }),
    ]);

    return message;
  }
}
