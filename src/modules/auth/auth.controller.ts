/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { LoginReqDto, LoginResDto } from './dtos/login.dto';
import { SignupReqDto, SignupResDto } from './dtos/signup.dto';
import { VerifyAccountDto, VerifyEmailRes } from './dtos/verify-email.dto';
import { ResetPasswordReqDto } from './dtos/reset-password.dto';
import { GetUser } from './decorators/get-user.decorator';
import { JwtUserAuthGuard } from './guards/jwt-user-auth.guard';
import { JwtUserDefaultAuthGuard } from './guards/jwt-user-auth.default.guard';
import { Constants, COOKIE_NAME } from 'src/shared/constants';
import { LogoutResDto } from './dtos/logout.dto';
import { RefreshResDto } from './dtos/refresh.dto';

import { UnauthorizedException } from 'src/exceptions';
import { ForgotPasswordReqDto } from './dtos/forgot-password.dto';
import {
  ChangePasswordReqDto,
  ChangePasswordResDto,
} from './dtos/change-password.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';

const convertJwtExpiryToMs = (expiry: string): number => {
  const value = parseInt(expiry.slice(0, -1), 10);
  const unit = expiry.slice(-1);

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 0;
  }
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/signup
  @ApiOkResponse({
    type: SignupResDto,
  })
  @HttpCode(200)
  @Post('signup')
  async signup(@Body(ValidationPipe) signupReqDto: SignupReqDto) {
    return this.authService.signup(signupReqDto);
  }

  // GET /auth/google
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google Sign-In' })
  async googleAuth(@Req() req: any) {
    // Guard redirects to Google
  }

  // GET /auth/google/callback
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google Sign-In callback' })
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const result = await this.authService.googleLogin(req.user);

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    if (result.success) {
      // Redirect to frontend with token in URL
      res.redirect(
        `${frontendUrl}/auth/google/success?token=${result.data.access_token}`,
      );
    } else {
      res.redirect(`${frontendUrl}/auth/google/error`);
    }
  }

  // POST /auth/verify-email
  @ApiOkResponse({
    type: VerifyEmailRes,
  })
  @HttpCode(200)
  @Post('verify-email')
  async verifyEmail(@Body(ValidationPipe) verifyAccountDto: VerifyAccountDto) {
    return this.authService.verifyEmail(verifyAccountDto);
  }

  @ApiOperation({
    summary: 'Request a password reset link to be sent to the provided email.',
  })
  @ApiOkResponse({
    type: SignupResDto, // Use SignupResDto for a generic success/message response
    description:
      'A password reset link has been sent (or message returned if email is not registered).',
  })
  @HttpCode(200)
  @Post('forgot-password')
  async forgotPassword(
    @Body(ValidationPipe) forgotPasswordReqDto: ForgotPasswordReqDto,
  ) {
    // The DTO must only contain the 'email' property
    return this.authService.forgotPassword(forgotPasswordReqDto.email);
  }

  @ApiOperation({
    summary: 'Set the new password using the temporary reset token.',
  })
  @ApiOkResponse({
    type: SignupResDto,
    description: 'Password has been successfully reset.',
  })
  @HttpCode(200)
  @Post('reset-password')
  async resetPassword(
    @Body(ValidationPipe) resetPasswordReqDto: ResetPasswordReqDto,
  ) {
    // The DTO must contain the 'password' and 'resetToken' properties
    return this.authService.resetPassword(resetPasswordReqDto);
  }

  // change password
  @ApiBearerAuth()
  @UseGuards(JwtUserAuthGuard)
  @ApiOperation({
    summary: 'Change password for authenticated user',
  })
  @ApiOkResponse({
    type: ChangePasswordResDto,
    description: 'Password has been successfully changed.',
  })
  @HttpCode(200)
  @Post('change-password')
  async changePassword(
    @GetUser() user,
    @Body(ValidationPipe) changePasswordReqDto: ChangePasswordReqDto,
  ): Promise<ChangePasswordResDto> {
    if (!user || !user._id) {
      throw UnauthorizedException.UNAUTHORIZED_ACCESS('User not authenticated');
    }

    return this.authService.changePassword(user._id, changePasswordReqDto);
  }

  // POST /auth/login
  @ApiOkResponse({
    type: LoginResDto,
  })
  @HttpCode(200)
  @Post('login')
  async login(
    @Body(ValidationPipe) loginReqDto: LoginReqDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const loginResponse = await this.authService.login(loginReqDto);

    const refreshTokenExpiryInMs = convertJwtExpiryToMs(
      Constants.refreshTokenExpiry,
    );

    const cookieExpiresAt = new Date(Date.now() + refreshTokenExpiryInMs);

    res.cookie(COOKIE_NAME, loginResponse.refreshToken, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === 'production' ||
        process.env.NODE_ENV === 'staging',
      sameSite:
        process.env.NODE_ENV === 'production' ||
        process.env.NODE_ENV === 'staging'
          ? 'none'
          : 'lax',
      path: '/',
      expires: cookieExpiresAt,
    });

    return loginResponse;
  }

  // POST /auth/logout
  @ApiBearerAuth()
  // @UseGuards(JwtUserAuthGuard)
  @ApiOkResponse({
    type: LogoutResDto,
  })
  @HttpCode(200)
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogoutResDto> {
    const accessToken = req.headers.authorization?.split(' ')[1];

    const refreshToken = req.cookies?.[COOKIE_NAME];

    if (!accessToken) {
      throw new Error('Access token missing from Authorization header.');
    }

    if (!refreshToken) {
      throw new Error('Refresh token missing from cookie.');
    }

    const logoutResult = await this.authService.logout(
      accessToken,
      refreshToken,
    );

    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === 'production' ||
        process.env.NODE_ENV === 'staging',
      sameSite: 'none',
    });

    return logoutResult;
  }

  // POST /auth/refresh
  // @UseGuards(RefreshTokenGuard)
  @ApiOkResponse({
    type: RefreshResDto,
  })
  @HttpCode(200)
  @Post('refresh')
  async refresh(@Req() req: Request): Promise<RefreshResDto> {
    const refreshToken = req.cookies?.[COOKIE_NAME];

    if (!refreshToken) {
      throw new Error('Refresh token missing from cookie.');
    }

    const newAccessToken = await this.authService.refreshToken(refreshToken);
    return { accessToken: newAccessToken };
  }

  @ApiBearerAuth()
  @UseGuards(JwtUserDefaultAuthGuard)
  @ApiOkResponse({
    type: SignupResDto,
  })
  @HttpCode(200)
  @Post('request-verification')
  async requestVerificationLink(@GetUser() user) {
    if (!user || !user.email) {
      throw new Error('User not found or email not provided');
    }
    return this.authService.requestVerificationLink(user.email);
  }
}
