import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Inject,
  Logger,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { YandexAuthService } from './yandex-auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import {
  RegisterDtoRequest,
  registerDtoRequestSchema,
  RegisterDtoResponse,
  LoginDtoResponse,
} from '@capsule/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { AccessTokenPayload } from './types/access-token-payload';
import { UserRepository } from 'src/user/user.repository';
import { JwtRefresh } from './decorators/jwt-refresh.decorator';
import { ZodValidationPipe } from 'src/shared/validation/zod-validation.pipe';
import { ConfigType } from '@nestjs/config';
import {
  frontendConfig,
  commonConfig,
} from 'src/config/env-config/load-config';

const YANDEX_STATE_COOKIE = 'yandex_oauth_state';
const YANDEX_STATE_TTL_MS = 10 * 60 * 1000;

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly yandexAuthService: YandexAuthService,
    private readonly userRepository: UserRepository,
    @Inject(frontendConfig.KEY)
    private readonly frontendCfg: ConfigType<typeof frontendConfig>,
    @Inject(commonConfig.KEY)
    private readonly commonCfg: ConfigType<typeof commonConfig>,
  ) {}

  @Post('login')
  @UseGuards(AuthGuard('local'))
  public async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginDtoResponse> {
    const token = this.authService.login(req.user as AccessTokenPayload);
    const { refreshToken, cookieParams } = this.authService.getRefreshToken(
      req.user as AccessTokenPayload,
    );

    res.cookie('refresh_token', refreshToken, cookieParams);

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
        avatarUrl: user.avatarUrl ?? undefined,
        bio: user.bio,
        capsulesQuantity: user.capsulesQuantity,
        id: user.id,
        gender: user.gender ?? undefined,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        isSubscribed: false,
      },
    };
  }

  @Post('register')
  @UsePipes(new ZodValidationPipe(registerDtoRequestSchema))
  async register(
    @Body() registerDto: RegisterDtoRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegisterDtoResponse> {
    const user = await this.authService.register({
      name: registerDto.name,
      fullName: registerDto.fullName,
      email: registerDto.email,
      gender: registerDto.gender,
      password: await bcrypt.hash(registerDto.password, 10),
    });

    const token = this.authService.login(user);
    const { refreshToken, cookieParams } =
      this.authService.getRefreshToken(user);
    res.cookie('refresh_token', refreshToken, cookieParams);

    return {
      ...token,
      user: {
        email: user.email,
        name: user.name,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl ?? undefined,
        bio: user.bio,
        capsulesQuantity: user.capsulesQuantity,
        id: user.id,
        gender: user.gender ?? undefined,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        isSubscribed: false,
      },
    };
  }

  @Get('yandex')
  public redirectToYandex(@Res() res: Response) {
    const state = randomBytes(16).toString('hex');

    res.cookie(YANDEX_STATE_COOKIE, state, {
      httpOnly: true,
      secure: this.commonCfg.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: YANDEX_STATE_TTL_MS,
      signed: true,
    });

    res.redirect(this.yandexAuthService.getAuthorizeUrl(state));
  }

  @Get('yandex/callback')
  public async yandexCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const storedState = req.signedCookies?.[YANDEX_STATE_COOKIE] as
      | string
      | undefined;

    res.clearCookie(YANDEX_STATE_COOKIE);

    if (!code || !state || !storedState || state !== storedState) {
      this.logger.error(
        `Yandex OAuth: invalid state (code=${Boolean(code)}, state=${Boolean(state)}, storedState=${Boolean(storedState)})`,
      );
      res.redirect(`${this.frontendCfg.url}/?yandexError=1`);

      return;
    }

    try {
      const profile = await this.yandexAuthService.getProfile(code);
      const user = await this.authService.loginOrRegisterWithYandex(profile);

      const { refreshToken, cookieParams } =
        this.authService.getRefreshToken(user);
      res.cookie('refresh_token', refreshToken, cookieParams);

      res.redirect(this.frontendCfg.url);
    } catch (error) {
      this.logger.error(
        'Yandex OAuth callback failed',
        error instanceof Error ? error.stack : error,
      );
      res.redirect(`${this.frontendCfg.url}/?yandexError=1`);
    }
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
      throw new InternalServerErrorException('Пользователь не найден');
    }

    const token = this.authService.login(req.user as AccessTokenPayload);
    const { refreshToken, cookieParams } = this.authService.getRefreshToken(
      req.user as AccessTokenPayload,
    );

    res.cookie('refresh_token', refreshToken, cookieParams);

    return token;
  }
}
