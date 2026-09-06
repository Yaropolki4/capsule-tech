import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { yandexAuthConfig } from 'src/config/env-config/load-config';
import { Gender } from '@prisma/client';
import { S3Service } from 'src/s3/s3.service';

const YANDEX_AUTHORIZE_URL = 'https://oauth.yandex.ru/authorize';
const YANDEX_TOKEN_URL = 'https://oauth.yandex.ru/token';
const YANDEX_INFO_URL = 'https://login.yandex.ru/info';
const YANDEX_AVATAR_SIZE = 'islands-200';

export type YandexProfile = {
  login: string;
  email?: string;
  displayName?: string;
  gender?: Gender;
  avatarUrl?: string;
};

type YandexTokenResponse = {
  access_token: string;
};

type YandexInfoResponse = {
  login: string;
  display_name?: string;
  real_name?: string;
  default_email?: string;
  emails?: string[];
  sex?: string;
  default_avatar_id?: string;
  is_avatar_empty?: boolean;
};

@Injectable()
export class YandexAuthService {
  private readonly logger = new Logger(YandexAuthService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly s3Service: S3Service,
    @Inject(yandexAuthConfig.KEY)
    private readonly config: ConfigType<typeof yandexAuthConfig>,
  ) {}

  public getAuthorizeUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.yandexClientId,
      redirect_uri: this.config.yandexCallbackUrl,
      scope: 'login:email login:info login:avatar',
      force_confirm: 'yes',
      state,
    });

    return `${YANDEX_AUTHORIZE_URL}?${params.toString()}`;
  }

  public async getProfile(code: string): Promise<YandexProfile> {
    const accessToken = await this.exchangeCode(code);

    return this.fetchProfile(accessToken);
  }

  private async exchangeCode(code: string): Promise<string> {
    try {
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.config.yandexClientId,
        client_secret: this.config.yandexClientSecret,
        redirect_uri: this.config.yandexCallbackUrl,
      });

      const response = await firstValueFrom(
        this.httpService.post<YandexTokenResponse>(
          YANDEX_TOKEN_URL,
          body.toString(),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
        ),
      );

      return response.data.access_token;
    } catch (error) {
      this.logError('Не удалось обменять code на токен Yandex ID', error);

      throw new InternalServerErrorException(
        'Не удалось авторизоваться через Yandex ID',
      );
    }
  }

  private async fetchProfile(accessToken: string): Promise<YandexProfile> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<YandexInfoResponse>(
          `${YANDEX_INFO_URL}?format=json`,
          { headers: { Authorization: `OAuth ${accessToken}` } },
        ),
      );
      const data = response.data;

      return {
        login: data.login,
        email: data.default_email ?? data.emails?.[0],
        displayName: data.real_name ?? data.display_name ?? data.login,
        gender: this.mapGender(data.sex),
        avatarUrl: await this.resolveAvatar(
          data.default_avatar_id,
          data.is_avatar_empty,
        ),
      };
    } catch (error) {
      this.logError('Не удалось получить профиль Yandex ID', error);

      throw new InternalServerErrorException(
        'Не удалось получить профиль Yandex ID',
      );
    }
  }

  private mapGender(sex: string | undefined): Gender | undefined {
    if (sex === 'male') return Gender.MALE;
    if (sex === 'female') return Gender.FEMALE;

    return undefined;
  }

  private async resolveAvatar(
    avatarId: string | undefined,
    isAvatarEmpty: boolean | undefined,
  ): Promise<string | undefined> {
    if (!avatarId || isAvatarEmpty) {
      return undefined;
    }

    const avatarUrl = `https://avatars.yandex.net/get-yapic/${avatarId}/${YANDEX_AVATAR_SIZE}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(avatarUrl, { responseType: 'arraybuffer' }),
      );
      const buffer = Buffer.from(response.data as ArrayBuffer);
      const mimetype =
        (response.headers['content-type'] as string) || 'image/jpeg';

      return await this.s3Service.uploadAvatar(
        crypto.randomUUID(),
        buffer,
        mimetype,
        null,
      );
    } catch (error) {
      this.logError('Не удалось загрузить аватар из Yandex ID', error);

      return undefined;
    }
  }

  private logError(message: string, error: unknown): void {
    const status = (error as { response?: { status?: unknown } })?.response
      ?.status;
    const details =
      (error as { response?: { data?: unknown } })?.response?.data ??
      (error instanceof Error ? error.message : error);

    this.logger.error(
      `${message} (status=${status ?? 'n/a'}): ${JSON.stringify(details)}`,
    );
  }
}
