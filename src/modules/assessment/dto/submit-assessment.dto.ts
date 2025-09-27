// dto/submit-assessment.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsMongoId } from 'class-validator';

export class SubmitAssessmentDto {
  @ApiProperty({
    example: '68d76eea50c4b6fd7da5fc06',
    description: 'Assessment ID',
  })
  @IsMongoId()
  assessment_id: string;

  @ApiProperty({
    example: {
      '68d76eeb50c4b6fd7da5fc14': 'opt-1', // Multiple choice response
      '68d76eeb50c4b6fd7da5fc16': ['opt-1', 'opt-3'], // Checkbox response
      '68d76eeb50c4b6fd7da5fc18': 'My Business Name', // Text response
      '68d76eec50c4b6fd7da5fc1e': {
        // Grid response
        'row-1': 'col-2',
        'row-2': 'col-3',
      },
    },
    description: 'User responses mapped by question ID',
  })
  @IsObject()
  responses: Record<string, any>;

  @ApiProperty({
    example: '68d76eea50c4b6fd7da5fc05',
    description: 'User ID (optional if authenticated)',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  user_id?: string;
}

export class SubmitAssessmentResDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Assessment completed successfully' })
  message: string;

  @ApiProperty({
    example: {
      user_score: 45,
      total_possible_points: 100,
      percentage_score: 45,
      user_level: 'Intermediate',
      recommended_services: [
        {
          id: '68d76eec50c4b6fd7da5fc22',
          service_id: 'intermediate_package',
          service_name: 'Digital Growth Package',
          description: 'Integrated solutions for growing businesses',
          min_points: 16,
          max_points: 30,
          level: ['Intermediate'],
          match_reason: 'Level Match',
        },
      ],
      assessment_title: 'Digital Readiness Assessment',
      completed_at: '2025-09-27T05:30:15.123Z',
    },
  })
  data?: {
    user_score: number;
    total_possible_points: number;
    percentage_score: number;
    user_level: string;
    recommended_services: any[];
    assessment_title: string;
    completed_at: string;
  };
}
