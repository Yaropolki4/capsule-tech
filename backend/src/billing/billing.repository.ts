import { Inject, Injectable } from '@nestjs/common';
import { TokenBalance, TokenBucket } from '@prisma/client';
import {
  SECURE_PRISMA_SERVICE,
  SecurePrismaService,
} from 'src/prisma/prisma.service';
import { BUCKET_LIMITS } from './billing.constants';
import { nextResetAt } from './reset-schedule.util';

@Injectable()
export class BillingRepository {
  constructor(
    @Inject(SECURE_PRISMA_SERVICE)
    private readonly prisma: SecurePrismaService,
  ) {}

  async getOrResetBalance(
    userId: string,
    bucket: TokenBucket,
    now = new Date(),
  ): Promise<TokenBalance> {
    const existing = await this.prisma.tokenBalance.findUnique({
      where: { userId_bucket: { userId, bucket } },
    });

    const limit = BUCKET_LIMITS[bucket];

    if (!existing) {
      return this.prisma.tokenBalance.create({
        data: {
          userId,
          bucket,
          remaining: limit,
          limit,
          resetAt: nextResetAt(now),
        },
      });
    }

    if (now >= existing.resetAt) {
      return this.prisma.tokenBalance.update({
        where: { id: existing.id },
        data: { remaining: limit, limit, resetAt: nextResetAt(now) },
      });
    }

    return existing;
  }

  decrement(userId: string, bucket: TokenBucket, tokens: number) {
    return this.prisma.tokenBalance.update({
      where: { userId_bucket: { userId, bucket } },
      data: { remaining: { decrement: tokens } },
    });
  }

  logUsage(event: {
    userId: string;
    bucket: TokenBucket;
    action: string;
    model: string;
    providerCostUsd: number;
    tokensCharged: number;
  }) {
    return this.prisma.tokenUsageEvent.create({ data: event });
  }
}
