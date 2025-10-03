import { ConfigType } from '@nestjs/config';
import { jwtConfig } from './env-config/load-config';

export function getJwtConfig(config: ConfigType<typeof jwtConfig>) {
  return {
    secret: config.secret,
    verifyOptions: {
      ignoreExpiration: false,
    },
  };
}
