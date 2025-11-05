// src/auth/strategies/google.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') as string,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') as string,
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') as string,
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: import('passport-google-oauth20').Profile,
    done: VerifyCallback,
  ): any {
    const { name, emails, photos } = profile;

    const user = {
      email: emails && emails.length > 0 ? emails[0].value : null,
      first_name: name?.givenName ?? null,
      last_name: name?.familyName ?? null,
      profile_picture: photos && photos.length > 0 ? photos[0].value : null,
      access_token: accessToken,
      google_id: profile.id,
    };

    done(null, user);
  }
}
