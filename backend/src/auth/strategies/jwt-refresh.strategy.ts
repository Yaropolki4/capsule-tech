import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigType } from '@nestjs/config';
import { AccessTokenPayload } from '../types/access-token-payload';
import { Request } from 'express';
import { jwtConfig } from 'src/config/env-config/load-config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @Inject(jwtConfig.KEY) private config: ConfigType<typeof jwtConfig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request.signedCookies.refresh_token as string;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: config.secret,
    });
  }

  public validate(payload: AccessTokenPayload) {
    return payload;
  }
}
