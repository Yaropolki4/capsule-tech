import { ConfigService } from '@nestjs/config';

export const isDev = (config: ConfigService) =>
  config.getOrThrow<string>('NODE_ENV') === 'development';
