import { Module } from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { AssessmentController } from './assessment.controller';
import { RepositoryModule } from '../repository/repository.module';
import { MongooseModelsModule } from '../mongoose-models/mongoose.models.module';
import { ServicesModule } from '../admin/services/services.module';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [
    RepositoryModule,
    MongooseModelsModule,
    ServicesModule,
    MailerModule,
  ],
  controllers: [AssessmentController],
  providers: [AssessmentService],
  exports: [AssessmentService],
})
export class AssessmentModule {}
