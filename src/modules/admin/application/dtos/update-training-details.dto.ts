// dtos/update-training-details.dto.ts
import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class UpdateTrainingDetailsDto {
  @ApiProperty({
    description: 'The URL of the uploaded training timetable.',
    required: false,
    example: 'https://storage.link/timetable_mire_plus.pdf',
  })
  @IsOptional()
  @IsString()
  timetable_url?: string;

  @ApiProperty({
    description: 'The start date of the training.',
    required: false,
    example: '2025-10-15',
  })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiProperty({
    description: 'The end date of the training.',
    required: false,
    example: '2025-10-30',
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @Exclude()
  @IsOptional()
  @IsString()
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  file?: any;
}
