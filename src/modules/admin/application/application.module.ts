import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminApplicationController } from './admin-application.controller';
import { AdminApplicationService } from './services/admin-application.service';
import {
  ApplicationForm,
  ApplicationFormSchema,
} from './schemas/application-form.schema';
import { Submission, SubmissionSchema } from './schemas/submission.schema';
import { QuestionValidationService } from './services/question-validation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ApplicationForm.name, schema: ApplicationFormSchema },
      { name: Submission.name, schema: SubmissionSchema },
    ]),
  ],
  controllers: [AdminApplicationController],
  providers: [AdminApplicationService, QuestionValidationService],
  exports: [AdminApplicationService, QuestionValidationService],
})
export class ApplicationModule {}
