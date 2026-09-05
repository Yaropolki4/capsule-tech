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
  yandexAuthConfig,
  s3Config,
  frontendConfig,
  backendConfig,
  commonConfig,
  openrouterConfig,
} from './config/env-config/load-config';
import { envSchema } from './config/env-config/env-schema';
import { SubscriptionModule } from './subscription/subscription.module';
import { CapsuleModule } from './capsule/capsule.module';
import { PostModule } from './post/post.module';
import { ChatModule } from './chat/chat.module';
import { UserPhotoModule } from './user-photo/user-photo.module';
import { TryOnModule } from './try-on/try-on.module';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [
        googleAuthConfig,
        yandexAuthConfig,
        s3Config,
        frontendConfig,
        backendConfig,
        commonConfig,
        openrouterConfig,
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
    CapsuleModule,
    PostModule,
    ChatModule,
    UserPhotoModule,
    TryOnModule,
    BillingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
