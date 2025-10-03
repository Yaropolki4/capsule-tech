import { Inject, Injectable } from '@nestjs/common';
import { Clothes } from '@prisma/client';
import {
  SECURE_PRISMA_SERVICE,
  SecurePrismaService,
} from 'src/prisma/prisma.service';

@Injectable()
export class ClothesRepository {
  constructor(
    @Inject(SECURE_PRISMA_SERVICE) private readonly prisma: SecurePrismaService,
  ) {}

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
