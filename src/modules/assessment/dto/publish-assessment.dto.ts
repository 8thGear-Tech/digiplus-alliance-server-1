import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class PublishAssessmentDto {
  @ApiProperty({
    description: 'Whether to publish or unpublish the assessment',
    example: true,
  })
  @IsBoolean()
  is_published: boolean;
}
