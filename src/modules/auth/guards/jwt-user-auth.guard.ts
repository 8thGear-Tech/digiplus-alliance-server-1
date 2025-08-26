import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';

import { UnauthorizedException } from '../../../exceptions/unauthorized.exception';

@Injectable()
export class JwtUserAuthGuard extends AuthGuard('authUser') {
  JSON_WEB_TOKEN_ERROR = 'JsonWebTokenError';
  TOKEN_EXPIRED_ERROR = 'TokenExpiredError';

  handleRequest(err: any, user: any, info: Error, context: any, status: any) {
    if (info?.name === this.JSON_WEB_TOKEN_ERROR) {
      // Pass an object conforming to IException to the constructor
      throw new UnauthorizedException({
        message: 'Invalid token.',
        code: 401,
        success: false,
      });
    } else if (info?.name === this.TOKEN_EXPIRED_ERROR) {
      // Pass an object for expired token
      throw new UnauthorizedException({
        message: 'Token expired.',
        code: 401,
        success: false,
      });
    } else if (info) {
      // Pass an object for general unauthorized access
      throw new UnauthorizedException({
        message: info.message || 'Unauthorized access.',
        code: 401,
        success: false,
      });
    } else if (err) {
      // Re-throw the original error if it's not a token-related issue
      throw err;
    } else if (!user) {
      // If no user is returned, the guard failed to authenticate
      throw new UnauthorizedException({
        message: 'Unauthorized access.',
        code: 401,
        success: false,
      });
    }

    return user;
  }
}
