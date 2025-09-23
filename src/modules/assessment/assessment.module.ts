import { Module } from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { AssessmentController } from './assessment.controller';
import { RepositoryModule } from '../repository/repository.module';
import { MongooseModelsModule } from '../mongoose-models/mongoose.models.module';

@Module({
  imports: [RepositoryModule, MongooseModelsModule],
  controllers: [AssessmentController],
  providers: [AssessmentService],
  exports: [AssessmentService],
})
export class AssessmentModule {}
