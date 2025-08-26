import { Module } from '@nestjs/common';
import { TokenQueryService } from './token.query-service';
import { RepositoryModule } from '../repository/repository.module';
import { MongooseModelsModule } from '../mongoose-models/mongoose.models.module';

@Module({
  imports: [RepositoryModule, MongooseModelsModule],
  providers: [TokenQueryService],
  exports: [TokenQueryService],
})
export class TokenModule {}
