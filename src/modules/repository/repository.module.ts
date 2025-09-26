// import { Module } from '@nestjs/common';
// import { getModelToken } from '@nestjs/mongoose';
// import { BaseRepository } from './base.repository';
// import { DatabaseModelNames, Repositories } from 'src/shared/enums';
// import { MongooseModelsModule } from '../mongoose-models/mongoose.models.module';
// import { UserSchema } from '../user/user.schema';
// // import { BusinessProfileSchema } from '../profile/schemas/business.owner.schema';
// import { BlogSchema } from '../admin/blog/blog.schema';
// import { UserSubmissionSchema } from '../business-owner/user-submission.schema';
// import { ApplicationFormSchema } from '../admin/application/schemas/application-form.schema';
// import { ServiceSchema } from '../admin/services/schemas/service.schema';

// @Module({
//   imports: [MongooseModelsModule],
//   providers: [
//     {
//       provide: Repositories.UserRepository,
//       useFactory: (userModel) => new BaseRepository(userModel),
//       inject: [getModelToken(DatabaseModelNames.USER)],
//     },
//     {
//       provide: Repositories.BusinessOwnerRepository,
//       useFactory: (businessOwnerModel) =>
//         new BaseRepository(businessOwnerModel),
//       inject: [getModelToken(DatabaseModelNames.BUSINESS_OWNER)],
//     },
//     {
//       provide: Repositories.AdminRepository,
//       useFactory: (adminModel) => new BaseRepository(adminModel),
//       inject: [getModelToken(DatabaseModelNames.ADMIN)],
//     },
//     {
//       provide: Repositories.RefreshTokenRepository,
//       useFactory: (refreshTokenModel) => new BaseRepository(refreshTokenModel),
//       inject: [getModelToken(DatabaseModelNames.REFRESH_TOKEN)],
//     },
//     {
//       provide: Repositories.TokenRepository,
//       useFactory: (tokenModel) => new BaseRepository(tokenModel),
//       inject: [getModelToken(DatabaseModelNames.TOKEN)],
//     },
//     {
//       provide: Repositories.AssessmentRepository,
//       useFactory: (assessmentModel) => new BaseRepository(assessmentModel),
//       inject: [getModelToken(DatabaseModelNames.ASSESSMENT)],
//     },
//     {
//       provide: Repositories.BlogRepository,
//       useFactory: (blogModel) => new BaseRepository(blogModel),
//       inject: [getModelToken(DatabaseModelNames.BLOG)],
//     },
//     {
//       provide: DatabaseModelNames.USER,
//       useValue: UserSchema,
//     },
//     {
//       provide: Repositories.AssessmentModuleRepository,
//       useFactory: (assessmentModuleModel) =>
//         new BaseRepository(assessmentModuleModel),
//       inject: [getModelToken(DatabaseModelNames.ASSESSMENT_MODULE)],
//     },
//     {
//       provide: Repositories.QuestionRepository,
//       useFactory: (questionModel) => new BaseRepository(questionModel),
//       inject: [getModelToken(DatabaseModelNames.QUESTION)],
//     },
//     {
//       provide: Repositories.UserAssessmentRepository,
//       useFactory: (userAssessmentModel) =>
//         new BaseRepository(userAssessmentModel),
//       inject: [getModelToken(DatabaseModelNames.USER_ASSESSMENT)],
//     },
//     {
//       provide: Repositories.ServiceRecommendationRepository,
//       useFactory: (serviceRecommendationModel) =>
//         new BaseRepository(serviceRecommendationModel),
//       inject: [getModelToken(DatabaseModelNames.SERVICE_RECOMMENDATION)],
//     },
//     {
//       provide: DatabaseModelNames.BLOG,
//       useValue: BlogSchema,
//     },
//     {
//       provide: Repositories.ApplicationFormRepository,
//       useFactory: (applicationFormModel) =>
//         new BaseRepository(applicationFormModel),
//       inject: [getModelToken(DatabaseModelNames.APPLICATION_FORM)],
//     },
//     {
//       provide: DatabaseModelNames.APPLICATION_FORM,
//       useValue: ApplicationFormSchema,
//     },
//     {
//       provide: Repositories.UserSubmissionRepository,
//       useFactory: (userSubmissionModel) =>
//         new BaseRepository(userSubmissionModel),
//       inject: [getModelToken(DatabaseModelNames.USER_SUBMISSION)],
//     },

//     {
//       provide: DatabaseModelNames.USER_SUBMISSION,
//       useValue: UserSubmissionSchema,
//     },

//     {
//       provide: Repositories.ServiceRepository,
//       useFactory: (serviceModel) => new BaseRepository(serviceModel),
//       inject: [getModelToken(DatabaseModelNames.SERVICE)],
//     },

//     {
//       provide: DatabaseModelNames.SERVICE,
//       useValue: ServiceSchema,
//     },
//   ],
//   exports: [
//     Repositories.UserRepository,
//     Repositories.BusinessOwnerRepository,
//     Repositories.AdminRepository,
//     Repositories.RefreshTokenRepository,
//     Repositories.TokenRepository,
//     Repositories.AssessmentRepository,
//     Repositories.AssessmentModuleRepository,
//     Repositories.QuestionRepository,
//     Repositories.UserAssessmentRepository,
//     Repositories.ServiceRecommendationRepository,
//     Repositories.BlogRepository,
//     Repositories.ApplicationFormRepository,
//     Repositories.UserSubmissionRepository,
//   ],
// })
// export class RepositoryModule {}

import { Module } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { BaseRepository } from './base.repository';
import { DatabaseModelNames, Repositories } from 'src/shared/enums';
import { MongooseModelsModule } from '../mongoose-models/mongoose.models.module';
import { UserSchema } from '../user/user.schema';
// import { BusinessProfileSchema } from '../profile/schemas/business.owner.schema';
import { BlogSchema } from '../admin/blog/blog.schema';

@Module({
  imports: [MongooseModelsModule],
  providers: [
    {
      provide: Repositories.UserRepository,
      useFactory: (userModel) => new BaseRepository(userModel),
      inject: [getModelToken(DatabaseModelNames.USER)],
    },
    {
      provide: Repositories.BusinessOwnerRepository,
      useFactory: (businessOwnerModel) =>
        new BaseRepository(businessOwnerModel),
      inject: [getModelToken(DatabaseModelNames.BUSINESS_OWNER)],
    },
    {
      provide: Repositories.AdminRepository,
      useFactory: (adminModel) => new BaseRepository(adminModel),
      inject: [getModelToken(DatabaseModelNames.ADMIN)],
    },
    {
      provide: Repositories.RefreshTokenRepository,
      useFactory: (refreshTokenModel) => new BaseRepository(refreshTokenModel),
      inject: [getModelToken(DatabaseModelNames.REFRESH_TOKEN)],
    },
    {
      provide: Repositories.TokenRepository,
      useFactory: (tokenModel) => new BaseRepository(tokenModel),
      inject: [getModelToken(DatabaseModelNames.TOKEN)],
    },
    {
      provide: Repositories.AssessmentRepository,
      useFactory: (assessmentModel) => new BaseRepository(assessmentModel),
      inject: [getModelToken(DatabaseModelNames.ASSESSMENT)],
    },
    {
      provide: Repositories.BlogRepository,
      useFactory: (blogModel) => new BaseRepository(blogModel),
      inject: [getModelToken(DatabaseModelNames.BLOG)],
    },
    {
      provide: DatabaseModelNames.USER,
      useValue: UserSchema,
    },
    {
      provide: Repositories.AssessmentModuleRepository,
      useFactory: (assessmentModuleModel) =>
        new BaseRepository(assessmentModuleModel),
      inject: [getModelToken(DatabaseModelNames.ASSESSMENT_MODULE)],
    },
    {
      provide: Repositories.QuestionRepository,
      useFactory: (questionModel) => new BaseRepository(questionModel),
      inject: [getModelToken(DatabaseModelNames.QUESTION)],
    },
    {
      provide: Repositories.UserAssessmentRepository,
      useFactory: (userAssessmentModel) =>
        new BaseRepository(userAssessmentModel),
      inject: [getModelToken(DatabaseModelNames.USER_ASSESSMENT)],
    },
    {
      provide: Repositories.ServiceRecommendationRepository,
      useFactory: (serviceRecommendationModel) =>
        new BaseRepository(serviceRecommendationModel),
      inject: [getModelToken(DatabaseModelNames.SERVICE_RECOMMENDATION)],
    },
    {
      provide: DatabaseModelNames.BLOG,
      useValue: BlogSchema,
    },
    {
      provide: Repositories.ApplicationFormRepository,
      useFactory: (applicationFormModel) =>
        new BaseRepository(applicationFormModel),
      inject: [getModelToken(DatabaseModelNames.APPLICATION_FORM)],
    },
  ],
  exports: [
    Repositories.UserRepository,
    Repositories.BusinessOwnerRepository,
    Repositories.AdminRepository,
    Repositories.RefreshTokenRepository,
    Repositories.TokenRepository,
    Repositories.AssessmentRepository,
    Repositories.AssessmentModuleRepository,
    Repositories.QuestionRepository,
    Repositories.UserAssessmentRepository,
    Repositories.ServiceRecommendationRepository,
    Repositories.BlogRepository,
    Repositories.ApplicationFormRepository,
  ],
})
export class RepositoryModule {}
