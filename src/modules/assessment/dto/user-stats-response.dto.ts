// src/assessment/dto/user-stats-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class SubmissionDetailDto {
  @ApiProperty({ description: 'Assessment ID' })
  assessment_id: string;

  @ApiProperty({ description: 'Assessment title' })
  assessment_title: string;

  @ApiProperty({ description: 'User ID who completed the assessment' })
  user_id?: string;

  @ApiProperty({ description: 'Score achieved by user' })
  user_score: number;

  @ApiProperty({ description: 'Maximum possible score' })
  max_possible_score: number;

  @ApiProperty({ description: 'Percentage score' })
  percentage_score: number;

  @ApiProperty({ description: 'ISO timestamp of completion' })
  completed_at?: string;

  @ApiProperty({ description: 'Formatted completion date' })
  completed_date: string;

  @ApiProperty({ description: 'Formatted completion time' })
  completed_time: string;
}

export class MonthlyBreakdownDto {
  @ApiProperty({ description: 'Month abbreviation (e.g., Jan, Feb)' })
  month: string;

  @ApiProperty({ description: 'Year' })
  year: number;

  @ApiProperty({ description: 'Average score for the month' })
  score?: number;

  @ApiProperty({ description: 'Average score for the month' })
  average_score?: number;

  @ApiProperty({ description: 'Total submissions for the month' })
  submissions: number;

  @ApiProperty({
    type: [SubmissionDetailDto],
    description: 'Detailed submission list',
  })
  submission_details: SubmissionDetailDto[];
}

export class SummaryDto {
  @ApiProperty({ description: 'Total number of submissions' })
  total_submissions: number;

  @ApiProperty({ description: 'Overall average score across all submissions' })
  overall_average_score: number;

  @ApiProperty({ description: 'Number of months with activity' })
  months_active?: number;

  @ApiProperty({ description: 'Number of months with submissions' })
  months_with_submissions?: number;
}

export class UserStatsDataDto {
  @ApiProperty({ description: 'Year of the statistics' })
  year: number;

  @ApiProperty({ type: SummaryDto, description: 'Summary statistics' })
  summary: SummaryDto;

  @ApiProperty({
    type: [MonthlyBreakdownDto],
    description: 'Monthly breakdown data',
  })
  monthly_breakdown: MonthlyBreakdownDto[];

  @ApiProperty({ description: 'ISO timestamp of generation' })
  generated_at: string;

  @ApiProperty({ description: 'Formatted generation date' })
  generated_date: string;

  @ApiProperty({ description: 'Formatted generation time' })
  generated_time: string;
}

export class UserStatsResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Monthly stats retrieved successfully' })
  message: string;

  @ApiProperty({ type: UserStatsDataDto })
  data: UserStatsDataDto;
}
