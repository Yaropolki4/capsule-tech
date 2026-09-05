import { Inject, Injectable } from '@nestjs/common';
import {
  SECURE_PRISMA_SERVICE,
  SecurePrismaService,
} from 'src/prisma/prisma.service';
import { CapsuleItemInput } from '@capsule/common';

@Injectable()
export class CapsuleRepository {
  constructor(
    @Inject(SECURE_PRISMA_SERVICE) private readonly prisma: SecurePrismaService,
  ) {}

  createWithItems(
    data: {
      name?: string;
      thumbnailUrl: string;
      createdById: string;
      public: boolean;
    },
    items: CapsuleItemInput[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      const capsule = await tx.capsule.create({
        data: {
          name: data.name,
          thumbnailUrl: data.thumbnailUrl,
          createdById: data.createdById,
          public: data.public,
        },
      });

      await tx.capsuleItem.createMany({
        data: items.map((item) => ({
          capsuleId: capsule.id,
          clothesId: item.clothesId,
          x: item.x,
          y: item.y,
          rotation: item.rotation,
          scale: item.scale,
          zIndex: item.zIndex,
        })),
      });

      await tx.user.update({
        where: { id: data.createdById },
        data: { capsulesQuantity: { increment: 1 } },
      });

      if (data.public) {
        await tx.post.create({
          data: {
            createdById: data.createdById,
            capsuleId: capsule.id,
          },
        });
      }

      return capsule;
    });
  }

  findById(id: string) {
    return this.prisma.capsule.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, avatarUrl: true },
        },
        items: {
          include: {
            clothes: {
              select: { imageUrl: true, brand: true, category: true },
            },
          },
        },
      },
    });
  }

  findManyByUserId(userId: string) {
    return this.prisma.capsule.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  deleteById(id: string, createdById: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.capsule.delete({ where: { id } });

      await tx.user.update({
        where: { id: createdById },
        data: { capsulesQuantity: { decrement: 1 } },
      });
    });
  }

  async findClothesOwnedBy(userId: string, clothesIds: string[]) {
    const owned = await this.prisma.userClothes.findMany({
      where: { userId, clothesId: { in: clothesIds } },
      select: { clothesId: true },
    });

    return owned.map((row) => row.clothesId);
  }
}
