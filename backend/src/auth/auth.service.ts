import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { AccessTokenPayload } from './types/access-token-payload';
import { UserRepository } from 'src/user/user.repository';
import { RegisterDtoRequest } from '@capsule/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
  ) {}

  public async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);

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

  public setRefreshToken(user: AccessTokenPayload, res: Response) {
    const payload: AccessTokenPayload = { email: user.email, id: user.id };

    res.cookie(
      'refresh_token',
      this.jwtService.sign(payload, { expiresIn: '7d' }),
      {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    );
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

    const newUser = await this.userRepository.create(registerDto);

    return newUser;
  }
}
