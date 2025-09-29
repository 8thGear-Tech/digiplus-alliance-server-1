import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { RepositoryModule } from '../repository/repository.module';
import { MongooseModelsModule } from '../mongoose-models/mongoose.models.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { MailerModule } from '../mailer/mailer.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    RepositoryModule,
    MongooseModelsModule,
    CloudinaryModule,
    MailerModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const env = process.env.NODE_ENV;
        const prefix =
          env === 'staging'
            ? 'staging'
            : env === 'production'
              ? 'production'
              : 'development';

        return {
          secret: configService.get<string>(`${prefix}.jwt.privateKey`),
          signOptions: {
            expiresIn: configService.get<string>(`${prefix}.jwt.expiresIn`),
            algorithm: 'HS256',
          },
          // signOptions: { algorithm: 'HS256' },
          // signOptions: { expiresIn: configService.get('development.jwt.expiresIn'), algorithm: 'HS256' },
          verifyOptions: {
            algorithms: ['HS256'],
          },
        };
      },
    }),
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
