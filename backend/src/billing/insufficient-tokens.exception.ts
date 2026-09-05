import { HttpException, HttpStatus } from '@nestjs/common';
import { TokenBucket } from '@prisma/client';
import { InsufficientTokensErrorDto } from '@capsule/common';

export class InsufficientTokensException extends HttpException {
  constructor(bucket: TokenBucket, resetAt: Date) {
    const body: InsufficientTokensErrorDto = {
      code: 'INSUFFICIENT_TOKENS',
      bucket,
      resetAt: resetAt.toISOString(),
    };

    super(body, HttpStatus.PAYMENT_REQUIRED);
  }
}
