// ============================================
// UNIFIED VALIDATION DTOs
// ============================================

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';

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

// ============================================
// NEW: Batch Validation Support
// ============================================

export class BatchValidationFieldDto {
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
  @IsOptional()
  value: any;
}

export class BatchValidateInputDto {
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
    type: [BatchValidationFieldDto],
    description: 'Array of fields to validate',
    example: [
      {
        questionIdentifier: 'email',
        value: 'john.doe@example.com',
      },
      {
        questionIdentifier: 'phone_number',
        value: '+1234567890',
      },
      {
        questionIdentifier: 'age',
        value: '25',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchValidationFieldDto)
  fields: BatchValidationFieldDto[];
}

// ============================================
// Response DTOs
// ============================================

export class ValidationErrorDto {
  @ApiProperty({ example: 'email' })
  type: string;

  @ApiProperty({ example: 'Please enter a valid email address' })
  message: string;

  @ApiProperty({ example: 'email' })
  field: string;
}

export class SingleValidationResultDto {
  @ApiProperty({ example: true })
  isValid: boolean;

  @ApiProperty({ type: [ValidationErrorDto] })
  errors: ValidationErrorDto[];

  @ApiProperty({ example: 'email' })
  field: string;

  @ApiProperty({ enum: FormType, example: FormType.APPLICATION })
  formType: FormType;
}

export class BatchValidationResultDto {
  @ApiProperty({ example: true })
  isValid: boolean;

  @ApiProperty({ example: 5 })
  totalFields: number;

  @ApiProperty({ example: 4 })
  validFields: number;

  @ApiProperty({ example: 1 })
  invalidFields: number;

  @ApiProperty({ type: [SingleValidationResultDto] })
  results: SingleValidationResultDto[];

  @ApiProperty({ enum: FormType, example: FormType.APPLICATION })
  formType: FormType;
}
