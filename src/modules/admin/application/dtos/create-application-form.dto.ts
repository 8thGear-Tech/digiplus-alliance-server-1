import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ValidationRule } from 'src/shared/enums';
import { QuestionType } from 'src/modules/assessment/enums/question-type.enum';
import { Types } from 'mongoose';

export class ModuleDto {
  @ApiProperty({
    example: 'Business Information',
    description: 'The title of the module.',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Module Description is optional.',
    description: 'An optional description for the module.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'business-info-module',
    description: 'A temporary ID for local referencing during form creation',
  })
  @IsString()
  temp_id: string;

  @ApiProperty({
    example: 1,
    description: 'The order/sequence of this module.',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  order?: number;
}

// Option structure for questions that have options
export class OptionDto {
  @ApiProperty({ example: 'opt-1' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Computer Science' })
  @IsString()
  text: string;

  @ApiProperty({ example: 'cs' })
  @IsString()
  value: string;
}

// Grid column structure
export class GridColumnDto {
  @ApiProperty({ example: 'col-1' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Not Interested' })
  @IsString()
  text: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  value: number;
}

// Grid row structure
export class GridRowDto {
  @ApiProperty({ example: 'row-1' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Introduction to AI' })
  @IsString()
  text: string;
}

export class QuestionDto {
  @ApiProperty({
    type: String,
    example: '654c6a654c6a4654c6a654c6a',
    description: 'The unique ID of the question (for updates).',
    required: false,
  })
  @IsOptional()
  _id?: Types.ObjectId;

  @ApiProperty({
    enum: QuestionType,
    example: QuestionType.MULTIPLE_CHOICE,
    description: 'The type of question.',
  })
  @IsNotEmpty()
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiProperty({
    example: 'Which degree program are you applying for?',
    description: 'The question text.',
  })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty({
    example: 'Please select your preferred program.',
    description: 'An optional description.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'Choose the option that best fits your career goals.',
    description: 'An optional instruction.',
    required: false,
  })
  @IsOptional()
  @IsString()
  instruction?: string;

  @ApiProperty({
    default: false,
    description: 'Indicates if an answer is required.',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_required?: boolean;

  @ApiProperty({
    example: 1,
    description: 'The step number for this question.',
  })
  @IsNotEmpty()
  @IsNumber()
  step: number;

  @ApiProperty({
    example: 'personal-info-module',
    description: 'The temporary ID of the module this question belongs to.',
  })
  @IsNotEmpty()
  @IsString()
  module_ref: string;

  // Auto-detected validation rule (set by transformer)
  @ApiProperty({
    enum: ValidationRule,
    description: 'Auto-detected validation rule based on question text',
    required: false,
  })
  @IsOptional()
  @IsEnum(ValidationRule)
  auto_validation?: ValidationRule;

  // Manual validation override
  @ApiProperty({
    enum: ValidationRule,
    description: 'Manual validation rule (overrides auto-detection)',
    required: false,
  })
  @IsOptional()
  @IsEnum(ValidationRule)
  manual_validation?: ValidationRule;

  // Validation parameters
  @ApiProperty({
    example: { min_length: 5, max_length: 100 },
    description: 'Parameters for validation rules',
    required: false,
  })
  @IsOptional()
  validation_params?: {
    min_length?: number;
    max_length?: number;
    custom_pattern?: string;
    error_message?: string;
  };

  // Optional fields for different question types

  // For multiple_choice, checkbox, dropdown
  @ApiProperty({
    type: [OptionDto],
    description: 'Array of options (for multiple choice, checkbox, dropdown)',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options?: OptionDto[];

  // For checkbox only
  @ApiProperty({
    example: 1,
    description: 'Minimum selections required (for checkbox)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  min_selections?: number;

  // For multiple_choice_grid
  @ApiProperty({
    type: [GridRowDto],
    description: 'Grid rows (for multiple choice grid)',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GridRowDto)
  grid_rows?: GridRowDto[];

  @ApiProperty({
    type: [GridColumnDto],
    description: 'Grid columns (for multiple choice grid)',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GridColumnDto)
  grid_columns?: GridColumnDto[];

  // For short_text, long_text
  @ApiProperty({
    example: 'Enter your response here...',
    description: 'Placeholder text (for text inputs)',
    required: false,
  })
  @IsOptional()
  @IsString()
  placeholder?: string;

  // For file_upload
  @ApiProperty({
    example: ['.pdf', '.docx', '.jpg'],
    description: 'Accepted file types (for file upload)',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  accepted_file_types?: string[];

  @ApiProperty({
    example: 'first-name',
    description: 'A unique key to programmatically identify this question.',
    required: false,
  })
  @IsOptional()
  @IsString()
  //   @Transform(({ value, obj }) => {
  //     // If the admin provides a data_key, use it.
  //     if (value) {
  //       return customSlugify(value);
  //     }
  //     // Otherwise, generate it from the question text.
  //     if (obj.question) {
  //       return customSlugify(obj.question);
  //     }
  //     return undefined;
  //   }
  // )
  data_key?: string;
}

export class CreateApplicationFormDto {
  @ApiProperty({
    example: 'Welcome to Our Assessment',
    description: 'Title shown on the welcome screen.',
    required: false,
  })
  @IsOptional()
  @IsString()
  welcome_title?: string;

  @ApiProperty({
    example: 'This assessment helps us understand your needs.',
    description: 'Message shown on the welcome screen.',
    required: false,
  })
  @IsOptional()
  @IsString()
  welcome_description?: string;

  @ApiProperty({
    example: 'Begin Assessment',
    description: 'Text for the CTA button on the welcome screen.',
    required: false,
  })
  @IsOptional()
  @IsString()
  welcome_button_text?: string;

  @ApiProperty({
    example: 'Please read the instructions carefully before proceeding.',
    description: 'Instructions shown on the welcome screen.',
    required: false,
  })
  @IsOptional()
  @IsString()
  welcome_instruction?: string;

  @ApiProperty({
    example: 'welcome-to-our-assessment',
    description: 'A unique slug for the form.',
    required: false,
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({
    type: [ModuleDto],
    description: 'An array of modules to organize the form.',
  })
  // @IsNotEmpty()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModuleDto)
  modules?: ModuleDto[];

  @ApiProperty({
    type: [QuestionDto],
    description: 'An array of question objects.',
  })
  // @IsNotEmpty()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions?: QuestionDto[];

  @ApiProperty({
    example: true,
    description: 'Indicates if the form is live and accessible to users.',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isLive?: boolean;
}

export class UpdateApplicationFormDto extends PartialType(
  CreateApplicationFormDto,
) {}
