import {
  PrismaService,
  SECURE_PRISMA_SERVICE,
  SecurePrismaService,
  UNSECURE_PRISMA_SERVICE,
} from 'src/prisma/prisma.service';
import { CreateUser } from './types';
import { Inject, Injectable } from '@nestjs/common';
import { EditUserRequestDto } from '@capsule/common';

@Injectable()
export class UserRepository {
  constructor(
    @Inject(SECURE_PRISMA_SERVICE) private readonly prisma: SecurePrismaService,
    @Inject(UNSECURE_PRISMA_SERVICE)
    private readonly unsafePrisma: PrismaService,
  ) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async unsafeFindByEmail(email: string) {
    return this.unsafePrisma.user.findUnique({
      where: { email },
    });
  }

  async findByName(name: string) {
    return this.prisma.user.findUnique({
      where: { name },
    });
  }

  async create(user: CreateUser) {
    return this.prisma.user.create({
      data: user,
    });
  }

  async update(
    name: string,
    data: EditUserRequestDto & { avatarUrl?: string },
  ) {
    return this.prisma.user.update({
      where: { name },
      data,
    });
  }

  async updateAvatar(name: string, file: Express.Multer.File) {
    return this.prisma.user.update({
      where: { name },
      data: { avatarUrl: file.filename },
    });
  }

  async getSubscriptions(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { followings: true },
    });
  }

  async isSubscribed(followerId: string, followingId: string) {
    return this.prisma.subscription.findFirst({
      where: { followerId, followingId },
    });
  }
}
