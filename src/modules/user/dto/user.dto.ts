import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApplicationStatus } from 'src/shared/enums';

export class UserDto {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  is_verified: boolean;
  company_website?: string;
  last_login?: string;
  applications_count?: number;
  assessments_count?: number;
}

export class GetUsersQueryDto {
  @ApiPropertyOptional({
    description:
      'Search by name or business (searches first_name, last_name, and business_name)',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  search?: string;

  // @ApiPropertyOptional({
  //   description: 'Filter by service name the user applied for',
  //   example: 'Premium Consulting',
  // })
  // @IsOptional()
  // @IsString()
  // service?: string;

  // @ApiPropertyOptional({
  //   description: 'Filter by application status',
  //   enum: ApplicationStatus,
  //   example: ApplicationStatus.BeingProcessed,
  // })
  // @IsOptional()
  // @IsEnum(ApplicationStatus)
  // status?: ApplicationStatus;

  // @ApiPropertyOptional({
  //   description: 'Filter by payment status',
  //   example: 'paid',
  // })
  // @IsOptional()
  // @IsString()
  // payment_status?: string;
}
