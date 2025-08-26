import { Module } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { BaseRepository } from './base.repository';
import {
  DatabaseCollectionNames,
  DatabaseModelNames,
  Repositories,
} from 'src/shared/enums';

import { TokenSchema } from '../token/token.schema';
import { MongooseModelsModule } from '../mongoose-models/mongoose.models.module';
import { UserSchema } from '../user/user.schema';
import { BusinessProfileSchema } from '../profile/schemas/business.owner.schema';

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
      provide: Repositories.RefreshTokenRepository,
      useFactory: (businessOwnerModel) =>
        new BaseRepository(businessOwnerModel),
      inject: [getModelToken(DatabaseModelNames.REFRESH_TOKEN)],
    },

    {
      provide: Repositories.TokenRepository,
      useFactory: (tokenModel) => new BaseRepository(tokenModel),
      inject: [getModelToken(DatabaseModelNames.TOKEN)],
    },
    {
      provide: DatabaseModelNames.USER,
      useValue: UserSchema,
    },
    {
      provide: DatabaseModelNames.BUSINESS_OWNER,
      useValue: BusinessProfileSchema,
    },
    {
      provide: DatabaseModelNames.REFRESH_TOKEN,
      useValue: TokenSchema,
    },
    {
      provide: DatabaseModelNames.TOKEN,
      useValue: TokenSchema,
    },
  ],
  exports: [...Object.values(Repositories)],
})
export class RepositoryModule {}
