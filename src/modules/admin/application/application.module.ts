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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ApplicationForm.name, schema: ApplicationFormSchema },
      { name: UserSubmission.name, schema: UserSubmissionSchema },
      { name: Service.name, schema: ServiceSchema },
    ]),
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
