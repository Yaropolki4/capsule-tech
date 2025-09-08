import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { AccessTokenPayload } from './types/access-token-payload';
import { UserRepository } from 'src/user/user.repository';
import { JwtRefresh } from './decorators/jwt-refresh.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userRepository: UserRepository,
  ) {}

  @Post('login')
  @UseGuards(AuthGuard('local'))
  public async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = this.authService.login(req.user as AccessTokenPayload);
    this.authService.setRefreshToken(req.user as AccessTokenPayload, res);
    const user = await this.userRepository.findByEmail(
      (req.user as AccessTokenPayload).email,
    );

    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    return {
      ...token,
      user: {
        email: user.email,
        name: user.name,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        capsulesQuantity: user.capsulesQuantity,
        id: user.id,
      },
    };
  }

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.register({
      name: registerDto.name,
      fullName: registerDto.fullName,
      email: registerDto.email,
      password: await bcrypt.hash(registerDto.password, 10),
    });

    const token = this.authService.login(user);
    this.authService.setRefreshToken(user, res);

    return {
      ...token,
      user: {
        email: user.email,
        name: user.name,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        capsulesQuantity: user.capsulesQuantity,
        id: user.id,
      },
    };
  }

  @Post('logout')
  public logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token');
  }

  @Post('refresh')
  @JwtRefresh()
  public async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.userRepository.findByEmail(
      (req.user as AccessTokenPayload).email,
    );

    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    const token = this.authService.login(req.user as AccessTokenPayload);
    this.authService.setRefreshToken(req.user as AccessTokenPayload, res);

    return token;
  }
}
