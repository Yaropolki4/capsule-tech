import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { AccessTokenPayload } from 'src/auth/types/access-token-payload';
import { Request } from 'express';
import {
  SubscribeDtoRequest,
  subscribeDtoRequestSchema,
  unsubscribeDtoRequestSchema,
  UnsubscribeDtoRequest,
  getSubscribersDtoRequestSchema,
  GetSubscribersDtoRequest,
  GetSubscribersResponseDto,
  GetFollowingDtoRequest,
  getFollowingDtoRequestSchema,
  GetFollowingResponseDto,
} from '@capsule/common';
import { ZodValidationPipe } from 'src/shared/validation/zod-validation.pipe';

@UseGuards(JwtGuard)
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('subscribe')
  public async subscribe(
    @Req() req: Request,
    @Body(new ZodValidationPipe(subscribeDtoRequestSchema))
    body: SubscribeDtoRequest,
  ) {
    const user = req.user as AccessTokenPayload;

    return await this.subscriptionService.subscribe(user.id, body.id);
  }

  @Post('unsubscribe')
  public async unsubscribe(
    @Req() req: Request,
    @Body(new ZodValidationPipe(unsubscribeDtoRequestSchema))
    body: UnsubscribeDtoRequest,
  ) {
    const user = req.user as AccessTokenPayload;

    return await this.subscriptionService.unsubscribe(body.id, user.id);
  }

  @Get('followers')
  public async getFollowers(
    @Query(new ZodValidationPipe(getSubscribersDtoRequestSchema))
    { id }: GetSubscribersDtoRequest,
    @Req() req: Request,
  ): Promise<GetSubscribersResponseDto> {
    const user = req.user as AccessTokenPayload;
    const subscribers = await this.subscriptionService.getFollowers(
      id,
      user.id,
    );

    return subscribers.map((subscriber) => ({
      ...subscriber,
      avatarUrl: subscriber.avatarUrl ?? undefined,
    }));
  }

  @Get('following')
  public async getFollowing(
    @Query(new ZodValidationPipe(getFollowingDtoRequestSchema))
    { id }: GetFollowingDtoRequest,
    @Req() req: Request,
  ): Promise<GetFollowingResponseDto> {
    const user = req.user as AccessTokenPayload;
    const following = await this.subscriptionService.getFollowing(id, user.id);

    return following.map((following) => ({
      ...following,
      avatarUrl: following.avatarUrl ?? undefined,
    }));
  }
}
