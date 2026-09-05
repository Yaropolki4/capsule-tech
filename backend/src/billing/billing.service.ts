import { Injectable, Logger } from '@nestjs/common';
import { TokenBucket } from '@prisma/client';
import { GetBalancesResponseDto } from '@capsule/common';
import { BillingRepository } from './billing.repository';
import { InsufficientTokensException } from './insufficient-tokens.exception';
import { USD_PER_TOKEN } from './billing.constants';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly billingRepository: BillingRepository) {}

  async assertHasBudget(userId: string, bucket: TokenBucket): Promise<void> {
    const balance = await this.billingRepository.getOrResetBalance(
      userId,
      bucket,
    );

    if (balance.remaining <= 0) {
      throw new InsufficientTokensException(bucket, balance.resetAt);
    }
  }

  async chargeUsage(
    userId: string,
    bucket: TokenBucket,
    input: { action: string; model: string; costUsd: number },
  ): Promise<void> {
    await this.billingRepository.getOrResetBalance(userId, bucket);

    const tokensCharged = Math.round(input.costUsd / USD_PER_TOKEN);

    await this.billingRepository.decrement(userId, bucket, tokensCharged);
    await this.billingRepository.logUsage({
      userId,
      bucket,
      action: input.action,
      model: input.model,
      providerCostUsd: input.costUsd,
      tokensCharged,
    });

    this.logger.debug(
      `charged user=${userId} bucket=${bucket} action=${input.action} ` +
        `costUsd=${input.costUsd} tokens=${tokensCharged}`,
    );
  }

  async getBalancesDto(userId: string): Promise<GetBalancesResponseDto> {
    const [chat, photo] = await Promise.all([
      this.billingRepository.getOrResetBalance(userId, 'CHAT'),
      this.billingRepository.getOrResetBalance(userId, 'PHOTO'),
    ]);

    return {
      chat: {
        remaining: chat.remaining,
        limit: chat.limit,
        resetAt: chat.resetAt.toISOString(),
      },
      photo: {
        remaining: photo.remaining,
        limit: photo.limit,
        resetAt: photo.resetAt.toISOString(),
      },
    };
  }
}
