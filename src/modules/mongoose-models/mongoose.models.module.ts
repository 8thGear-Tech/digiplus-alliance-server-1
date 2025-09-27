// import { MongooseModule } from '@nestjs/mongoose';
// import { DatabaseModelNames } from 'src/shared/enums';
// import { Module } from '@nestjs/common';
// import { UserSchema } from '../user/user.schema';
// import { BusinessProfileSchema } from '../profile/schemas/business.owner.schema';
// import { RefreshTokenSchema } from '../auth/schemas/refresh-token.schema';
// import { TokenSchema } from '../token/token.schema';
// import { AdminProfileSchema } from '../profile/schemas/admin.schema';
// import { QuestionSchema } from '../assessment/schemas/question.schema';
// import { AssessmentSchema } from '../assessment/schemas/assessment.schema';
// import { AssessmentModuleSchema } from '../assessment/schemas/assessment-module.schema';
// import { UserAssessmentSchema } from '../assessment/schemas/user-assessment.schema';
// import { ServiceRecommendationSchema } from '../assessment/schemas/service-recommendation.schema';
// import { BlogSchema } from '../admin/blog/blog.schema';
// import { ApplicationFormSchema } from '../admin/application/schemas/application-form.schema';
// import { UserSubmissionSchema } from '../business-owner/user-submission.schema';
// import { ServiceSchema } from '../admin/services/schemas/service.schema';

// @Module({
//   imports: [
//     MongooseModule.forFeature([
//       { name: DatabaseModelNames.USER, schema: UserSchema },
//       {
//         name: DatabaseModelNames.BUSINESS_OWNER,
//         schema: BusinessProfileSchema,
//       },
//       {
//         name: DatabaseModelNames.ADMIN,
//         schema: AdminProfileSchema,
//       },
//       { name: DatabaseModelNames.REFRESH_TOKEN, schema: RefreshTokenSchema },
//       { name: DatabaseModelNames.TOKEN, schema: TokenSchema },
//       { name: DatabaseModelNames.QUESTION, schema: QuestionSchema },
//       { name: DatabaseModelNames.ASSESSMENT, schema: AssessmentSchema },
//       {
//         name: DatabaseModelNames.ASSESSMENT_MODULE,
//         schema: AssessmentModuleSchema,
//       },
//       {
//         name: DatabaseModelNames.USER_ASSESSMENT,
//         schema: UserAssessmentSchema,
//       },
//       {
//         name: DatabaseModelNames.SERVICE_RECOMMENDATION,
//         schema: ServiceRecommendationSchema,
//       },
//       {
//         name: DatabaseModelNames.SERVICE,
//         schema: ServiceSchema,
//       },
//       { name: DatabaseModelNames.BLOG, schema: BlogSchema },
//       {
//         name: DatabaseModelNames.APPLICATION_FORM,
//         schema: ApplicationFormSchema,
//       },
//       {
//         name: DatabaseModelNames.USER_SUBMISSION,
//         schema: UserSubmissionSchema,
//       },
//     ]),
//   ],
//   exports: [MongooseModule],
// })
// export class MongooseModelsModule {}

import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModelNames } from 'src/shared/enums';
import { Module } from '@nestjs/common';
import { UserSchema } from '../user/user.schema';
import { BusinessProfileSchema } from '../profile/schemas/business.owner.schema';
import { RefreshTokenSchema } from '../auth/schemas/refresh-token.schema';
import { TokenSchema } from '../token/token.schema';
import { AdminProfileSchema } from '../profile/schemas/admin.schema';
import { QuestionSchema } from '../assessment/schemas/question.schema';
import { AssessmentSchema } from '../assessment/schemas/assessment.schema';
import { AssessmentModuleSchema } from '../assessment/schemas/assessment-module.schema';
import { UserAssessmentSchema } from '../assessment/schemas/user-assessment.schema';
import { ServiceRecommendationSchema } from '../assessment/schemas/service-recommendation.schema';
import { BlogSchema } from '../admin/blog/blog.schema';
import { ApplicationFormSchema } from '../admin/application/schemas/application-form.schema';
import { UserSubmissionSchema } from '../business-owner/user-submission.schema';
import { ServiceSchema } from '../admin/services/schemas/service.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DatabaseModelNames.USER, schema: UserSchema },
      {
        name: DatabaseModelNames.BUSINESS_OWNER,
        schema: BusinessProfileSchema,
      },
      {
        name: DatabaseModelNames.ADMIN,
        schema: AdminProfileSchema,
      },
      { name: DatabaseModelNames.REFRESH_TOKEN, schema: RefreshTokenSchema },
      { name: DatabaseModelNames.TOKEN, schema: TokenSchema },
      { name: DatabaseModelNames.QUESTION, schema: QuestionSchema },
      { name: DatabaseModelNames.ASSESSMENT, schema: AssessmentSchema },
      {
        name: DatabaseModelNames.ASSESSMENT_MODULE,
        schema: AssessmentModuleSchema,
      },
      {
        name: DatabaseModelNames.USER_ASSESSMENT,
        schema: UserAssessmentSchema,
      },
      {
        name: DatabaseModelNames.SERVICE_RECOMMENDATION,
        schema: ServiceRecommendationSchema,
      },
      { name: DatabaseModelNames.BLOG, schema: BlogSchema },
      {
        name: DatabaseModelNames.APPLICATION_FORM,
        schema: ApplicationFormSchema,
      },
      {
        name: DatabaseModelNames.USER_SUBMISSION,
        schema: UserSubmissionSchema,
      },
      {
        name: DatabaseModelNames.SERVICE,
        schema: ServiceSchema,
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class MongooseModelsModule {}
