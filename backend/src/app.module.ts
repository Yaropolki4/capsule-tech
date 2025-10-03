import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { S3Module } from './s3/s3.module';
import { ClothesModule } from './clothes/clothes.module';
import { AuthModule } from './auth/auth.module';
import {
  googleAuthConfig,
  s3Config,
  cropServerUrlConfig,
  frontendConfig,
  backendConfig,
  commonConfig,
} from './config/env-config/load-config';
import { envSchema } from './config/env-config/env-schema';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        googleAuthConfig,
        s3Config,
        cropServerUrlConfig,
        frontendConfig,
        backendConfig,
        commonConfig,
      ],
      validate: (config) => {
        return envSchema.parse(config);
      },
    }),
    PrismaModule,
    UserModule,
    S3Module,
    ClothesModule,
    AuthModule,
    SubscriptionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
