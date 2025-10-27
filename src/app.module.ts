/* eslint-disable @typescript-eslint/require-await */
import { Module, ValidationError, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'path';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { developmentConfig, productionConfig, stagingConfig } from './config';

import * as dotenv from 'dotenv';

import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import {
  // AllExceptionsFilter,
  BadRequestExceptionFilter,
  ForbiddenExceptionFilter,
  NotFoundExceptionFilter,
  UnauthorizedExceptionFilter,
  ValidationExceptionFilter,
} from './filters';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { AssessmentModule } from './modules/assessment/assessment.module';
import { MongooseModelsModule } from './modules/mongoose-models/mongoose.models.module';
import { ProfileModule } from './modules/profile/profile.module';
import { BlogModule } from './modules/admin/blog/blog.module';
import { ApplicationModule } from './modules/admin/application/application.module';
import { UserApplicationModule } from './modules/business-owner/user-application.module';
import { ServicesModule } from './modules/admin/services/services.module';
import { ContactModule } from './modules/general/contact/contact.module';
import { UnifiedValidationModule } from './modules/form-validation-rules/unified-validation.module';
import { NotificationModule } from './modules/notification/notification.module';

dotenv.config();

// Helper function to get current environment
const getEnvironment = (): 'development' | 'staging' | 'production' => {
  const env = process.env.NODE_ENV;
  if (env === 'staging') return 'staging';
  if (env === 'production') return 'production';
  return 'development';
};

// Helper function to load appropriate config
const loadConfig = () => {
  const env = getEnvironment();
  switch (env) {
    case 'staging':
      return stagingConfig;
    case 'production':
      return productionConfig;
    default:
      return developmentConfig;
  }
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, './../../.env'),
      load: [loadConfig()],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const env = getEnvironment();
        const uri = configService.get<string>(`${env}.mongodbConnectionUrl`);

        console.log('NODE_ENV:', process.env.NODE_ENV);
        console.log('Resolved environment:', env);
        console.log('Resolved Mongo URI:', uri);

        if (!uri) {
          throw new Error(
            `MongoDB connection URI is undefined for environment: ${env}`,
          );
        }
        return { uri };
      },
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const env = getEnvironment();

        return {
          transport: {
            host: configService.get<string>(`${env}.mail.BREVO_HOST`),
            port: configService.get<number>(`${env}.mail.BREVO_PORT`),
            secure: false,
            auth: {
              user: configService.get<string>(`${env}.mail.BREVO_USER`),
              pass: configService.get<string>(`${env}.mail.BREVO_PASS`),
            },
            tls: {
              rejectUnauthorized: false,
            },
          },
          defaults: {
            from: '"DigiPlus Alliance DIH: No Reply" <support@digiplus.africa>',
          },
          template: {
            dir: join(__dirname, './../src/templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    AssessmentModule,
    MongooseModelsModule,
    ProfileModule,
    AssessmentModule,
    BlogModule,
    ApplicationModule,
    UserApplicationModule,
    ServicesModule,
    ContactModule,
    UnifiedValidationModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_FILTER, useClass: ValidationExceptionFilter },
    { provide: APP_FILTER, useClass: BadRequestExceptionFilter },
    { provide: APP_FILTER, useClass: UnauthorizedExceptionFilter },
    { provide: APP_FILTER, useClass: ForbiddenExceptionFilter },
    { provide: APP_FILTER, useClass: NotFoundExceptionFilter },
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          exceptionFactory: (errors: ValidationError[]) => {
            return errors[0];
          },
        }),
    },
  ],
})
export class AppModule {}
