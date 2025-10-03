import { Module, Global } from '@nestjs/common';
import { PrismaService, UNSECURE_PRISMA_SERVICE } from './prisma.service';
import {
  SECURE_PRISMA_SERVICE,
  getSecurePrismaService,
} from './prisma.service';

@Global()
@Module({
  providers: [
    {
      provide: SECURE_PRISMA_SERVICE,
      useFactory: () => {
        return getSecurePrismaService();
      },
    },
    {
      provide: UNSECURE_PRISMA_SERVICE,
      useFactory: () => {
        return new PrismaService();
      },
    },
  ],
  exports: [SECURE_PRISMA_SERVICE, UNSECURE_PRISMA_SERVICE],
})
export class PrismaModule {}
