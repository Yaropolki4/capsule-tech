import { Inject, Injectable } from '@nestjs/common';
import {
  SECURE_PRISMA_SERVICE,
  SecurePrismaService,
} from 'src/prisma/prisma.service';

@Injectable()
export class UserPhotoRepository {
  constructor(
    @Inject(SECURE_PRISMA_SERVICE) private readonly prisma: SecurePrismaService,
  ) {}

  create(data: { imageUrl: string; userId: string }) {
    return this.prisma.userPhoto.create({ data });
  }

  findManyByUserId(userId: string) {
    return this.prisma.userPhoto.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.userPhoto.findUnique({ where: { id } });
  }

  deleteById(id: string) {
    return this.prisma.userPhoto.delete({ where: { id } });
  }
}
