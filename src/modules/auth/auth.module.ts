/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { JwtUserStrategy } from './strategies/jwt-user.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailerModule } from '../mailer/mailer.module';
import { TokenModule } from '../token/token.module';
import { RepositoryModule } from '../repository/repository.module';
import { MongooseModelsModule } from '../mongoose-models/mongoose.models.module';
import { JwtUserDefaultStrategy } from './strategies/jwt.user.default.strategy';
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const env = configService.get('NODE_ENV');
        return {
          secret: configService.get(`${env + '.jwt.privateKey'}`),
          signOptions: {
            expiresIn: configService.get(`${env + '.jwt.expiresIn'}`),
            algorithm: 'HS256',
          },
          // signOptions: { algorithm: 'HS256' },
          verifyOptions: {
            algorithms: ['HS256'],
          },
        };
      },
    }),
    MailerModule,
    TokenModule,
    RepositoryModule,
    MongooseModelsModule,
  ],
  providers: [JwtUserStrategy, AuthService, JwtUserDefaultStrategy],
  controllers: [AuthController],
  exports: [JwtUserStrategy, JwtUserDefaultStrategy],
})
export class AuthModule {}
