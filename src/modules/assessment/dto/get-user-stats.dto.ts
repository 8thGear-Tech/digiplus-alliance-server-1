// src/assessment/dto/get-user-stats.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsNumberString } from 'class-validator';

export class GetUserStatsParamsDto {
  @ApiProperty({
    description: 'The ID of the user whose stats should be retrieved',
    example: '66f0f98e95dc1c8e7ac44b8d',
  })
  @IsMongoId()
  userId: string;
}

export class GetUserStatsQueryDto {
  @ApiPropertyOptional({
    description: 'Optional year to filter stats (defaults to current year)',
    example: '2025',
  })
  @IsOptional()
  @IsNumberString()
  year?: string;
}
