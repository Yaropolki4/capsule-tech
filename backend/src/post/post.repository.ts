import { Inject, Injectable } from '@nestjs/common';
import {
  SECURE_PRISMA_SERVICE,
  SecurePrismaService,
} from 'src/prisma/prisma.service';

@Injectable()
export class PostRepository {
  constructor(
    @Inject(SECURE_PRISMA_SERVICE) private readonly prisma: SecurePrismaService,
  ) {}

  create(data: {
    text?: string;
    createdById: string;
    capsuleId?: string;
    clothesId?: string;
  }) {
    return this.prisma.post.create({ data });
  }

  getFeed(
    cursor: string | undefined,
    limit: number,
    viewerId: string,
    authorId?: string,
  ) {
    return this.prisma.post.findMany({
      where: authorId
        ? { createdById: authorId }
        : {
            OR: [
              { capsuleId: null, clothesId: null },
              { capsule: { public: true } },
              { clothes: { public: true } },
            ],
          },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        createdBy: {
          select: { id: true, name: true, avatarUrl: true },
        },
        capsule: {
          select: { id: true, name: true, thumbnailUrl: true },
        },
        clothes: {
          select: { id: true, imageUrl: true, brand: true, category: true },
        },
        likes: {
          where: { userId: viewerId },
          select: { userId: true },
        },
      },
    });
  }

  findCapsuleOwnedBy(userId: string, capsuleId: string) {
    return this.prisma.capsule.findFirst({
      where: { id: capsuleId, createdById: userId },
      select: { id: true },
    });
  }

  findClothesOwnedBy(userId: string, clothesId: string) {
    return this.prisma.userClothes.findFirst({
      where: { userId, clothesId },
      select: { clothesId: true },
    });
  }

  findById(id: string) {
    return this.prisma.post.findUnique({ where: { id } });
  }

  getLike(postId: string, userId: string) {
    return this.prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });
  }

  likePost(postId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.postLike.create({ data: { postId, userId } });

      return tx.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      });
    });
  }

  unlikePost(postId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.postLike.delete({
        where: { postId_userId: { postId, userId } },
      });

      return tx.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
      });
    });
  }
}
