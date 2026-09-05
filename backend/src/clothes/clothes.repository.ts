import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Clothes } from '@prisma/client';
import {
  SECURE_PRISMA_SERVICE,
  SecurePrismaService,
} from 'src/prisma/prisma.service';

type CreateClothesInput = Pick<
  Clothes,
  'brand' | 'category' | 'imageUrl' | 'createdById'
> &
  Partial<
    Pick<
      Clothes,
      'description' | 'source' | 'sourceUrl' | 'generationPrompt' | 'externalId'
    >
  > & { embedding?: number[] };

@Injectable()
export class ClothesRepository {
  constructor(
    @Inject(SECURE_PRISMA_SERVICE) private readonly prisma: SecurePrismaService,
  ) {}

  create({ embedding, ...clothes }: CreateClothesInput) {
    return this.prisma.$transaction(async (tx) => {
      const record = await tx.clothes.create({
        data: clothes,
      });

      if (embedding) {
        const vectorLiteral = `[${embedding.join(',')}]`;

        await tx.$executeRaw`
          UPDATE clothes SET embedding = ${vectorLiteral}::vector WHERE id = ${record.id}
        `;
      }

      await tx.userClothes.create({
        data: { clothesId: record.id, userId: clothes.createdById },
      });

      return record;
    });
  }

  async getUserClothes(
    userId: string,
    { sortedByCreatedAt }: { sortedByCreatedAt?: boolean } = {
      sortedByCreatedAt: false,
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userClothes: {
          include: {
            clothes: true,
          },
          orderBy: { createdAt: sortedByCreatedAt ? 'desc' : undefined },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user.userClothes.map((userClothes) => userClothes.clothes);
  }

  remove(id: string, userId: string) {
    return this.prisma.userClothes.delete({
      where: { userId_clothesId: { userId, clothesId: id } },
    });
  }

  findById(id: string) {
    return this.prisma.clothes.findUnique({ where: { id } });
  }

  findManyByIds(ids: string[]) {
    return this.prisma.clothes.findMany({
      where: { id: { in: ids } },
      select: { id: true, imageUrl: true, brand: true, category: true },
    });
  }

  addToWardrobe(userId: string, clothesId: string) {
    return this.prisma.userClothes.upsert({
      where: { userId_clothesId: { userId, clothesId } },
      create: { userId, clothesId },
      update: {},
    });
  }
}
