// dto/submit-assessment.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsMongoId } from 'class-validator';

//added by opeyemi

export class SubmitAssessmentDto {
  @ApiProperty({
    example: '68d76eea50c4b6fd7da5fc06',
    description: 'Assessment ID',
  })
  @IsMongoId()
  assessment_id: string;

  @ApiProperty({
    example: {
      // 1. Multiple Choice (or Dropdown): key = QID, value = single Option ID
      '68d76eeb50c4b6fd7da5fc14': 'opt-1',

      // 2. Checkbox: key = QID, value = array of Option IDs
      '68d76eeb50c4b6fd7da5fc16': ['opt-1', 'opt-3', 'opt-5'],

      // 3. Short Text: key = QID, value = string
      '68d76eeb50c4b6fd7da5fc18': 'My Business Name',

      // 4. Long Text (Hypothetical ID): key = QID, value = longer string
      '68d76eeb50c4b6fd7da5fc19': 'Our primary challenge is adoption speed.',

      // 5. Multiple Choice Grid: key = QID, value = map of {Row ID: Column ID}
      '68d76eec50c4b6fd7da5fc1e': {
        'row-1': 'col-2',
        'row-2': 'col-3',
        'row-3': 'col-5',
      },

      // 6. Dropdown (If different from multiple_choice, e.g., points difference)
      '68d76eec50c4b6fd7da5fc20': 'opt-6',
    },
    description:
      'User responses mapped by question ID. Note: IDs are unique per deployed assessment.',
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
    percentage_score: number | null;
    user_level: string;
    recommended_services: any[];
    assessment_title: string;
    completed_at: string;
  };
}
