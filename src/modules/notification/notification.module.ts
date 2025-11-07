import { Module } from '@nestjs/common';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';
import { BaseRepository } from '../repository/base.repository';
import { Repositories } from 'src/shared/enums';
import { UserSchema } from '../user/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    {
      provide: Repositories.NotificationRepository,
      useFactory: (model) => new BaseRepository(model),
      inject: [getModelToken(Notification.name)],
    },
    {
      provide: Repositories.UserRepository,
      useFactory: (model) => new BaseRepository(model),
      inject: [getModelToken('User')],
    },
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
