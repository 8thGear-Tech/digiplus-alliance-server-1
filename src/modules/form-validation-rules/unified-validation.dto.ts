// ============================================
// UNIFIED VALIDATION DTOs
// ============================================

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum FormType {
  APPLICATION = 'application',
  ASSESSMENT = 'assessment',
}

export class GetValidationRulesDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'The ID of the form (application or assessment)',
  })
  @IsNotEmpty()
  @IsString()
  formId: string;

  @ApiProperty({
    enum: FormType,
    example: FormType.APPLICATION,
    description: 'Type of form to validate',
  })
  @IsEnum(FormType)
  formType: FormType;
}

export class ValidateInputDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'The ID of the form/assessment',
  })
  @IsNotEmpty()
  @IsString()
  formId: string;

  @ApiProperty({
    enum: FormType,
    example: FormType.APPLICATION,
    description: 'Type of form being validated',
  })
  @IsEnum(FormType)
  formType: FormType;

  @ApiProperty({
    example: 'first_name',
    description: 'The data_key (applications) or question_id (assessments)',
  })
  @IsNotEmpty()
  @IsString()
  questionIdentifier: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The value to validate',
  })
  @IsNotEmpty()
  value: any;
}
