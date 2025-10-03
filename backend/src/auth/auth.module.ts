import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { getJwtConfig } from 'src/config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtGuard } from './guards/jwt.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtRefreshGuard } from './guards/jwt-refresh-guard';
import { jwtConfig } from 'src/config/env-config/load-config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfig)],
      useFactory: getJwtConfig,
      inject: [jwtConfig.KEY],
    }),
    PrismaModule,
    forwardRef(() => UserModule),
    ConfigModule.forFeature(jwtConfig),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtGuard,
    JwtRefreshStrategy,
    JwtRefreshGuard,
  ],
  exports: [AuthService, JwtStrategy, JwtGuard],
})
export class AuthModule {}
