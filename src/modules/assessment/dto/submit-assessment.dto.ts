import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SubmitAnswerDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  question_id: string;

  @ApiProperty({ example: 'opt-1' })
  answer: any;

  @ApiProperty({ required: false, example: 10 })
  score?: number;
}

export class SubmitAssessmentDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  assessment_id: string;

  @ApiProperty({ type: [SubmitAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerDto)
  answers: SubmitAnswerDto[];
}

export class SubmitAssessmentResDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data?: {
    total_score: number;
    max_possible_score: number;
    percentage_score: number;
    feedback?: string;
    suggested_services?: string[];
  };
}
