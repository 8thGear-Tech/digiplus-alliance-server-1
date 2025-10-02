import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UnifiedValidationController } from './unified-validation.controller';
import { UnifiedValidationService } from './unified-validation.service';
import { QuestionValidationService } from '../admin/application/services/question-validation.service';
import {
  ApplicationForm,
  ApplicationFormSchema,
} from '../admin/application/schemas/application-form.schema';

import {
  Question,
  QuestionSchema,
} from '../assessment/schemas/question.schema';
import {
  Assessment,
  AssessmentSchema,
} from '../assessment/schemas/assessment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ApplicationForm.name, schema: ApplicationFormSchema },
      { name: Assessment.name, schema: AssessmentSchema },
      { name: Question.name, schema: QuestionSchema },
    ]),
  ],
  controllers: [UnifiedValidationController],
  providers: [UnifiedValidationService, QuestionValidationService],
  exports: [UnifiedValidationService],
})
export class UnifiedValidationModule {}
