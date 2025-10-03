import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionRepository } from './subscription.repository';
import { UserRepository } from 'src/user/user.repository';
import {
  SECURE_PRISMA_SERVICE,
  SecurePrismaService,
} from 'src/prisma/prisma.service';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly userRepository: UserRepository,
    @Inject(SECURE_PRISMA_SERVICE)
    private readonly prisma: SecurePrismaService,
  ) {}

  async subscribe(followerId: string, followingId: string) {
    const follower = await this.userRepository.findById(followerId);
    const following = await this.userRepository.findById(followingId);

    if (!follower) {
      throw new NotFoundException('Follower not found');
    }

    if (!following) {
      throw new NotFoundException('Following not found');
    }

    if (follower.id === following.id) {
      throw new BadRequestException('You cannot subscribe to yourself');
    }

    const subscription = await this.subscriptionRepository.getSubscription(
      followerId,
      followingId,
    );

    if (subscription) {
      throw new BadRequestException('You are already subscribed to this user');
    }

    return await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: followerId },
        data: { followingCount: { increment: 1 } },
      });

      await tx.user.update({
        where: { id: followingId },
        data: { followersCount: { increment: 1 } },
      });

      return await this.subscriptionRepository.createSubscription(
        followerId,
        followingId,
      );
    });
  }

  async unsubscribe(followingId: string, followerId: string) {
    const follower = await this.userRepository.findById(followerId);
    const following = await this.userRepository.findById(followingId);

    if (!follower) {
      throw new NotFoundException('Follower not found');
    }

    if (!following) {
      throw new NotFoundException('Following not found');
    }

    const subscription = await this.subscriptionRepository.getSubscription(
      followerId,
      followingId,
    );

    if (!subscription) {
      throw new BadRequestException('You are not subscribed to this user');
    }

    return await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: followingId },
        data: { followersCount: { decrement: 1 } },
      });

      await tx.user.update({
        where: { id: followerId },
        data: { followingCount: { decrement: 1 } },
      });

      return await tx.subscription.delete({
        where: { followerId_followingId: { followerId, followingId } },
      });
    });
  }

  async getFollowers(profileId: string, currentUserId: string) {
    return await this.subscriptionRepository.getFollowersWithSubscriptionStatus(
      profileId,
      currentUserId,
    );
  }

  async getFollowing(profileId: string, currentUserId: string) {
    return await this.subscriptionRepository.getFollowingWithSubscriptionStatus(
      profileId,
      currentUserId,
    );
  }
}
