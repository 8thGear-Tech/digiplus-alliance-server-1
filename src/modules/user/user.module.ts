import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RepositoryModule } from '../repository/repository.module';
import { MongooseModelsModule } from '../mongoose-models/mongoose.models.module';
import { ApplicationModule } from '../admin/application/application.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserSubmission,
  UserSubmissionSchema,
} from '../business-owner/user-submission.schema';
import {
  UserAssessment,
  UserAssessmentSchema,
} from '../assessment/schemas/user-assessment.schema';

@Module({
  imports: [
    RepositoryModule,
    MongooseModelsModule,
    ApplicationModule,
    MongooseModule.forFeature([
      { name: UserSubmission.name, schema: UserSubmissionSchema },
      { name: UserAssessment.name, schema: UserAssessmentSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
