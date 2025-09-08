import { ConfigService } from '@nestjs/config';

// eslint-disable-next-line @typescript-eslint/require-await
export async function getJwtConfig(configService: ConfigService) {
  return {
    secret: configService.getOrThrow<string>('JWT_SECRET'),
    verifyOptions: {
      ignoreExpiration: false,
    },
  };
}
