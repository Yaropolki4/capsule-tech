import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export const SECURE_PRISMA_SERVICE = Symbol('SECURE_PRISMA_SERVICE');
export const UNSECURE_PRISMA_SERVICE = Symbol('UNSECURE_PRISMA_SERVICE');

export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

export function getSecurePrismaService() {
  return new PrismaService({
    omit: {
      user: { password: true },
    },
  });
}

export type SecurePrismaService = ReturnType<typeof getSecurePrismaService>;
