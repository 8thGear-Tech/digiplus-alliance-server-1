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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
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
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
