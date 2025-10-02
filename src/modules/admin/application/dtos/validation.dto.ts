// import { ApiProperty } from '@nestjs/swagger';
// import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

// export class ValidateInputDto {
//   @ApiProperty({
//     example: '507f1f77bcf86cd799439011',
//     description: 'The ID of the form being validated',
//   })
//   @IsNotEmpty()
//   @IsString()
//   formId: string;

//   @ApiProperty({
//     example: 'first_name',
//     description: 'The data_key of the question being validated',
//   })
//   @IsNotEmpty()
//   @IsString()
//   questionDataKey: string;

//   @ApiProperty({
//     example: 'John Doe',
//     description:
//       'The value to validate (can be string, number, array, or object depending on question type)',
//   })
//   @IsNotEmpty()
//   value: any; // Can be string, array, object depending on question type

//   @ApiProperty({
//     example: { row_id: 'row-1', column_id: 'col-2' },
//     description: 'Additional context for grid questions (optional)',
//     required: false,
//   })
//   @IsOptional()
//   @IsObject()
//   context?: {
//     row_id?: string;
//     column_id?: string;
//     selected_options?: string[];
//   };
// }

// export class ValidationErrorDto {
//   @ApiProperty({
//     example: 'email',
//     description: 'The type of validation that failed',
//   })
//   type: string;

//   @ApiProperty({
//     example: 'Please enter a valid email address',
//     description: 'Human-readable error message',
//   })
//   message: string;

//   @ApiProperty({
//     example: 'first_name',
//     description: 'The data_key of the field with the error',
//   })
//   field: string;
// }

// export class ValidationResultDto {
//   @ApiProperty({
//     example: true,
//     description: 'Whether the input passes all validation rules',
//   })
//   isValid: boolean;

//   @ApiProperty({
//     type: [ValidationErrorDto],
//     description: 'Array of validation errors (empty if valid)',
//   })
//   errors: ValidationErrorDto[];

//   @ApiProperty({
//     example: 'first_name',
//     description: 'The data_key of the validated field',
//   })
//   field: string;
// }

// export class QuestionValidationRuleDto {
//   @ApiProperty({
//     example: 'first_name',
//     description: 'The data_key of the question',
//   })
//   data_key: string;

//   @ApiProperty({
//     example: 'What is your first name?',
//     description: 'The question text',
//   })
//   question: string;

//   @ApiProperty({
//     example: 'short_text',
//     description: 'The type of question',
//   })
//   type: string;

//   @ApiProperty({
//     example: 1,
//     description: 'The step number',
//   })
//   step: number;

//   @ApiProperty({
//     description: 'Validation rules for this question',
//   })
//   validation: {
//     required: boolean;
//     rules: Array<{
//       type: string;
//       message: string;
//       pattern?: string;
//       value?: any;
//     }>;
//   };
// }

// export class FormValidationRulesResponseDto {
//   @ApiProperty({
//     example: '507f1f77bcf86cd799439011',
//     description: 'The ID of the form',
//   })
//   formId: string;

//   @ApiProperty({
//     example: 'Application for DigiPlus Services',
//     description: 'The title of the form',
//   })
//   formTitle: string;

//   @ApiProperty({
//     type: [QuestionValidationRuleDto],
//     description: 'Array of validation rules for each question',
//   })
//   validationRules: QuestionValidationRuleDto[];

//   @ApiProperty({
//     example: 25,
//     description: 'Total number of questions in the form',
//   })
//   totalQuestions: number;
// }
