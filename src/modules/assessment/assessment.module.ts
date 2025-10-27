import { Module } from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { AssessmentController } from './assessment.controller';
import { RepositoryModule } from '../repository/repository.module';
import { MongooseModelsModule } from '../mongoose-models/mongoose.models.module';
import { ServicesModule } from '../admin/services/services.module';
import { MailerModule } from '../mailer/mailer.module';
import { QuestionValidationService } from '../admin/application/services/question-validation.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    RepositoryModule,
    MongooseModelsModule,
    ServicesModule,
    MailerModule,
    NotificationModule,
  ],
  controllers: [AssessmentController],
  providers: [AssessmentService, QuestionValidationService],
  exports: [AssessmentService, QuestionValidationService],
})
export class AssessmentModule {}
