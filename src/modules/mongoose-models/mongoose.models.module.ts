import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModelNames } from 'src/shared/enums';
import { Module } from '@nestjs/common';
import { UserSchema } from '../user/user.schema';
import { BusinessProfileSchema } from '../profile/schemas/business.owner.schema';
import { RefreshTokenSchema } from '../auth/schemas/refresh-token.schema';
import { TokenSchema } from '../token/token.schema';
import { AdminProfileSchema } from '../profile/schemas/admin.schema';
import { BlogSchema } from '../admin/blog/blog.schema';

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
      { name: DatabaseModelNames.BLOG, schema: BlogSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class MongooseModelsModule {}
