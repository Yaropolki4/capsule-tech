import { Injectable } from '@nestjs/common';
import { Clothes } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ClothesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    clothes: Pick<Clothes, 'brand' | 'category' | 'imageUrl' | 'createdById'>,
  ) {
    return this.prisma.clothes.create({
      data: clothes,
    });
  }

  getUserClothes(userId: string) {
    return this.prisma.clothes.findMany({
      where: { createdById: userId },
    });
  }
}
