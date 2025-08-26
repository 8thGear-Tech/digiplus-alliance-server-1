import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

import { UnauthorizedException } from 'src/exceptions/unauthorized.exception';
import { Repositories } from 'src/shared/enums';
import { BaseRepository } from 'src/modules/repository/base.repository';
import { RefreshToken } from '../schemas/refresh-token.schema';
import { COOKIE_NAME } from 'src/shared/constants';
@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refreshToken',
) {
  constructor(
    private readonly configService: ConfigService,
    @Inject(Repositories.RefreshTokenRepository)
    private readonly refreshTokenRepository: BaseRepository<RefreshToken>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies[COOKIE_NAME],
      ]),
      secretOrKey: configService.get('development.jwt.privateKey'),
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.cookies[COOKIE_NAME];
    if (!refreshToken) {
      throw UnauthorizedException.UNAUTHORIZED_ACCESS(
        'Refresh token not found',
      );
    }

    const storedToken = await this.refreshTokenRepository.findOne({
      token: refreshToken,
    });
    if (!storedToken) {
      throw UnauthorizedException.UNAUTHORIZED_ACCESS(
        'Refresh token not found',
      );
    }

    return payload;
  }
}
