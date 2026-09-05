import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { Response } from 'express';
import { AccessTokenPayload } from './types/access-token-payload';
import { UserRepository } from 'src/user/user.repository';
import { RegisterDtoRequest } from '@capsule/common';
import { YandexProfile } from './yandex-auth.service';
import { commonConfig } from 'src/config/env-config/load-config';

const NAME_SAFE_CHARS_PATTERN = /[^a-zA-Z0-9_.-]/g;

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    @Inject(commonConfig.KEY)
    private readonly commonCfg: ConfigType<typeof commonConfig>,
  ) {}

  public async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.unsafeFindByEmail(email);

    if (!user) {
      throw new BadRequestException({
        message: 'Пользователь с такой электронной почтой не существует',
        cause: 'email',
      });
    }

    if (!user.password) {
      throw new BadRequestException({
        message: 'Неверный пароль',
        cause: 'password',
      });
    }

    const isMatch: boolean = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
      throw new BadRequestException({
        message: 'Неверный пароль',
        cause: 'password',
      });
    }

    return user;
  }

  public login(user: AccessTokenPayload) {
    const payload = { email: user.email, id: user.id };

    return { accessToken: this.jwtService.sign(payload, { expiresIn: '1d' }) };
  }

  public getRefreshToken(user: AccessTokenPayload) {
    const payload: AccessTokenPayload = { email: user.email, id: user.id };

    return {
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
      cookieParams: {
        httpOnly: true,
        secure: this.commonCfg.nodeEnv === 'production',
        sameSite: this.commonCfg.nodeEnv === 'production' ? 'none' : 'lax',
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        signed: true,
      },
    } as const;
  }

  public async register(registerDto: RegisterDtoRequest) {
    const user = await this.userRepository.findByEmail(registerDto.email);

    if (user) {
      throw new BadRequestException({
        message: 'Пользователь с такой электронной почтой уже существует',
        cause: 'email',
      });
    }

    const userByName = await this.userRepository.findByName(registerDto.name);

    if (userByName) {
      throw new BadRequestException({
        message: 'Пользователь с таким именем уже существует',
        cause: 'name',
      });
    }

    const newUser = await this.userRepository.create({
      ...registerDto,
      fullName: registerDto.fullName ?? registerDto.name,
    });

    return newUser;
  }

  public async loginOrRegisterWithYandex(profile: YandexProfile) {
    if (!profile.email) {
      throw new BadRequestException({
        message: 'В аккаунте Yandex ID не указан email',
        cause: 'email',
      });
    }

    const existingUser = await this.userRepository.findByEmail(profile.email);

    if (existingUser) {
      return existingUser;
    }

    const name = await this.generateUniqueName(
      profile.login || profile.email.split('@')[0],
    );

    return this.userRepository.create({
      email: profile.email,
      name,
      fullName: profile.displayName || name,
      gender: profile.gender,
      avatarUrl: profile.avatarUrl,
    });
  }

  private async generateUniqueName(base: string): Promise<string> {
    const sanitizedBase =
      base.replace(NAME_SAFE_CHARS_PATTERN, '').toLowerCase() || 'user';

    let candidate = sanitizedBase;
    let suffix = 1;

    while (await this.userRepository.findByName(candidate)) {
      suffix += 1;
      candidate = `${sanitizedBase}${suffix}`;
    }

    return candidate;
  }
}
