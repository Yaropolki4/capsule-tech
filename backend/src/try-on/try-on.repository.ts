import { Inject, Injectable } from '@nestjs/common';
import {
  SECURE_PRISMA_SERVICE,
  SecurePrismaService,
} from 'src/prisma/prisma.service';

const tryOnInclude = {
  userPhoto: { select: { id: true, imageUrl: true } },
  capsule: { select: { id: true, name: true, thumbnailUrl: true } },
  clothes: {
    select: { id: true, imageUrl: true, brand: true, category: true },
  },
} as const;

@Injectable()
export class TryOnRepository {
  constructor(
    @Inject(SECURE_PRISMA_SERVICE) private readonly prisma: SecurePrismaService,
  ) {}

  findUserPhotoOwnedBy(userId: string, userPhotoId: string) {
    return this.prisma.userPhoto.findFirst({
      where: { id: userPhotoId, userId },
      select: { id: true, imageUrl: true },
    });
  }

  findAccessibleClothesById(id: string, userId: string) {
    return this.prisma.clothes.findFirst({
      where: { id, OR: [{ public: true }, { createdById: userId }] },
      select: { id: true, imageUrl: true, brand: true, category: true },
    });
  }

  findAccessibleCapsuleWithItems(id: string, userId: string) {
    return this.prisma.capsule.findFirst({
      where: { id, OR: [{ public: true }, { createdById: userId }] },
      select: {
        id: true,
        name: true,
        thumbnailUrl: true,
        items: {
          include: {
            clothes: { select: { imageUrl: true } },
          },
        },
      },
    });
  }

  create(data: {
    userId: string;
    userPhotoId: string;
    resultImageUrl: string;
    capsuleId?: string;
    clothesId?: string;
  }) {
    return this.prisma.tryOn.create({ data, include: tryOnInclude });
  }

  findManyByUserId(userId: string) {
    return this.prisma.tryOn.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: tryOnInclude,
    });
  }

  findById(id: string) {
    return this.prisma.tryOn.findUnique({ where: { id } });
  }

  deleteById(id: string) {
    return this.prisma.tryOn.delete({ where: { id } });
  }
}
