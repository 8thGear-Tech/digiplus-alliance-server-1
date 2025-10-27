import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminApplicationController } from './admin-application.controller';
import { AdminApplicationService } from './services/admin-application.service';
import {
  ApplicationForm,
  ApplicationFormSchema,
} from './schemas/application-form.schema';
import {
  UserSubmission,
  UserSubmissionSchema,
} from 'src/modules/business-owner/user-submission.schema';

import { QuestionValidationService } from './services/question-validation.service';
import { QuestionDataKeyService } from './services/question-data-key.service';
import { Service, ServiceSchema } from '../services/schemas/service.schema';

import { CloudinaryModule } from 'src/modules/cloudinary/cloudinary.module';
import { RepositoryModule } from 'src/modules/repository/repository.module';
import { NotificationModule } from 'src/modules/notification/notification.module';
import { BaseRepository } from 'src/modules/repository/base.repository';
import { UserApplicationModule } from 'src/modules/business-owner/user-application.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ApplicationForm.name, schema: ApplicationFormSchema },
      { name: UserSubmission.name, schema: UserSubmissionSchema },
      { name: Service.name, schema: ServiceSchema },
    ]),

    CloudinaryModule,
    RepositoryModule,
    NotificationModule,
    BaseRepository,
    UserApplicationModule,
  ],

  controllers: [AdminApplicationController],
  providers: [
    AdminApplicationService,
    QuestionValidationService,
    QuestionDataKeyService,
  ],
  exports: [
    AdminApplicationService,
    QuestionValidationService,
    QuestionDataKeyService,
  ],
})
export class ApplicationModule {}
