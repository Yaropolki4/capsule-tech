import { Inject, Injectable } from '@nestjs/common';
import {
  SECURE_PRISMA_SERVICE,
  SecurePrismaService,
} from 'src/prisma/prisma.service';

@Injectable()
export class SubscriptionRepository {
  constructor(
    @Inject(SECURE_PRISMA_SERVICE) private readonly prisma: SecurePrismaService,
  ) {}

  public getSubscription(followerId: string, followingId: string) {
    return this.prisma.subscription.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
  }

  public createSubscription(followerId: string, followingId: string) {
    return this.prisma.subscription.create({
      data: { followerId, followingId },
    });
  }

  public deleteSubscription(followerId: string, followingId: string) {
    return this.prisma.subscription.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });
  }

  public async getFollowersWithSubscriptionStatus(
    profileId: string,
    currentUserId: string,
  ) {
    return (
      await this.prisma.subscription.findMany({
        where: { followingId: profileId },
        select: {
          follower: {
            select: {
              id: true,
              name: true,
              fullName: true,
              bio: true,
              capsulesQuantity: true,
              avatarUrl: true,
              followersCount: true,
              followingCount: true,
              followers: {
                select: {
                  followerId: true,
                },
                where: {
                  followerId: currentUserId,
                },
              },
            },
          },
        },
      })
    ).map((subscriber) => ({
      id: subscriber.follower.id,
      name: subscriber.follower.name,
      fullName: subscriber.follower.fullName,
      bio: subscriber.follower.bio,
      capsulesQuantity: subscriber.follower.capsulesQuantity,
      avatarUrl: subscriber.follower.avatarUrl,
      followersCount: subscriber.follower.followersCount,
      followingCount: subscriber.follower.followingCount,
      isSubscribed: subscriber.follower.followers.length > 0,
    }));
  }

  public async getFollowingWithSubscriptionStatus(
    profileId: string,
    currentUserId: string,
  ) {
    console.log(profileId, currentUserId);
    console.log(
      await this.prisma.subscription.findMany({
        where: {
          followerId: profileId,
        },
        select: {
          following: {
            select: {
              id: true,
              name: true,
              fullName: true,
              bio: true,
              capsulesQuantity: true,
              avatarUrl: true,
              followersCount: true,
              followingCount: true,
              followers: {
                select: {
                  followerId: true,
                },
              },
              followings: {
                select: {
                  followingId: true,
                },
              },
            },
          },
        },
      }),
    );
    return (
      await this.prisma.subscription.findMany({
        where: {
          followerId: profileId,
        },
        select: {
          following: {
            select: {
              id: true,
              name: true,
              fullName: true,
              bio: true,
              capsulesQuantity: true,
              avatarUrl: true,
              followersCount: true,
              followingCount: true,
              followers: {
                where: {
                  followerId: currentUserId,
                },
                select: {
                  followerId: true,
                },
              },
            },
          },
        },
      })
    ).map((following) => ({
      id: following.following.id,
      name: following.following.name,
      fullName: following.following.fullName,
      bio: following.following.bio,
      capsulesQuantity: following.following.capsulesQuantity,
      avatarUrl: following.following.avatarUrl,
      followersCount: following.following.followersCount,
      followingCount: following.following.followingCount,
      isSubscribed: following.following.followers.length > 0,
    }));
  }
}
