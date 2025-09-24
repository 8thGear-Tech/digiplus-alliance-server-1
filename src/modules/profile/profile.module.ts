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
        return {
          secret: configService.get('production.jwt.privateKey'),
          // secret: configService.get('development.jwt.privateKey'),
          // signOptions: {
          expiresIn: configService.get('production.jwt.expiresIn'),
          //   algorithm: 'HS256',
          // },
          // signOptions: {
          //   expiresIn: configService.get('development.jwt.expiresIn'),
          //   algorithm: 'HS256',
          // },
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
