// src/assessment/dto/user-stats-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class SubmissionDetailDto {
  @ApiProperty() assessment_id: string;
  @ApiProperty() user_score: number;
  @ApiProperty() max_possible_score: number;
  @ApiProperty() percentage_score: number;
  @ApiProperty() completed_at: string;
  @ApiProperty() completed_date: string;
  @ApiProperty() completed_time: string;
}

export class MonthlyBreakdownDto {
  @ApiProperty() month: string;
  @ApiProperty() year: number;
  @ApiProperty() score: number;
  @ApiProperty() submissions: number;
  @ApiProperty({ type: [SubmissionDetailDto] })
  submission_details: SubmissionDetailDto[];
}

export class SummaryDto {
  @ApiProperty() total_submissions: number;
  @ApiProperty() overall_average_score: number;
  @ApiProperty() months_active: number;
}

export class UserStatsDataDto {
  @ApiProperty() year: number;
  @ApiProperty({ type: SummaryDto }) summary: SummaryDto;
  @ApiProperty({ type: [MonthlyBreakdownDto] })
  monthly_breakdown: MonthlyBreakdownDto[];
  @ApiProperty() generated_at: string;
  @ApiProperty() generated_date: string;
  @ApiProperty() generated_time: string;
}

export class UserStatsResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Monthly stats retrieved successfully' })
  message: string;

  @ApiProperty({ type: UserStatsDataDto })
  data: UserStatsDataDto;
}
