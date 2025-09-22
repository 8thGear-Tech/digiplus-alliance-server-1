import { Module } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { BaseRepository } from './base.repository';
import { DatabaseModelNames, Repositories } from 'src/shared/enums';
import { MongooseModelsModule } from '../mongoose-models/mongoose.models.module';

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
  ],
  exports: [
    Repositories.UserRepository,
    Repositories.BusinessOwnerRepository,
    Repositories.AdminRepository,
    Repositories.RefreshTokenRepository,
    Repositories.TokenRepository,
    Repositories.AssessmentRepository,
    Repositories.AssessmentModuleRepository, // Temporarily comment this out
    Repositories.QuestionRepository,
    Repositories.UserAssessmentRepository,
    Repositories.ServiceRecommendationRepository,
  ],
})
export class RepositoryModule {}
