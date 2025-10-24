import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserApplicationController } from './user-application.controller';
import { UserApplicationService } from './user-application.service';
import { UserSubmission, UserSubmissionSchema } from './user-submission.schema';
import {
  ApplicationForm,
  ApplicationFormSchema,
} from '../admin/application/schemas/application-form.schema';
import {
  Service,
  ServiceSchema,
} from '../admin/services/schemas/service.schema';
import { MailerModule } from '../mailer/mailer.module';
import { RepositoryModule } from '../repository/repository.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserSubmission.name, schema: UserSubmissionSchema },
      { name: ApplicationForm.name, schema: ApplicationFormSchema },
      { name: Service.name, schema: ServiceSchema },
    ]),
    MailerModule,
    RepositoryModule,
  ],
  controllers: [UserApplicationController],
  providers: [UserApplicationService],
})
export class UserApplicationModule {}
