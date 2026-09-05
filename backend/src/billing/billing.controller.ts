import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { GetBalancesResponseDto } from '@capsule/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { AccessTokenPayload } from 'src/auth/types/access-token-payload';
import { BillingService } from './billing.service';

@Controller('billing')
@UseGuards(JwtGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('balances')
  async getBalances(@Req() req: Request): Promise<GetBalancesResponseDto> {
    const user = req.user as AccessTokenPayload;

    return this.billingService.getBalancesDto(user.id);
  }
}
