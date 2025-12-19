import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNumber,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '../enums/question-type.enum';
import { RecommendationLevel } from '../enums/recommendation-level.enum';

// Base question DTO with common properties
export class BaseQuestionDto {
  @ApiProperty({ example: 'What is your current digital skill level?' })
  @IsString()
  question: string;

  @ApiProperty({
    example: 'Please select the most appropriate option',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Choose one option', required: false })
  @IsOptional()
  @IsString()
  instruction?: string;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  is_required?: boolean;

  @ApiProperty({ example: 1 })
  @IsNumber()
  step: number;

  @ApiProperty({
    example: 10,
    default: 0,
    description: 'Maximum points possible for this question',
  })
  @IsOptional()
  @IsNumber()
  max_points?: number;

  @ApiProperty({
    example: 'module-1',
    description: 'Reference to module by its temporary ID',
  })
  @IsString()
  module_ref: string;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({
    example: ['digital_literacy', 'business_tools'],
    required: false,
    description:
      'Categories this question contributes to for service recommendations',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scoring_categories?: string[];

  @ApiProperty({
    default: false,
    description: 'Set to true to delete this question during update',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  toDelete?: boolean;
}

// Welcome Screen DTO
export class CreateWelcomeScreenDto extends BaseQuestionDto {
  @ApiProperty({ enum: [QuestionType.WELCOME_SCREEN] })
  @IsEnum([QuestionType.WELCOME_SCREEN])
  type: QuestionType.WELCOME_SCREEN;

  @ApiProperty({
    example: 'Welcome to Digital Maturity Assessment',
    description: 'Title for the welcome screen',
  })
  @IsString()
  welcome_title: string;

  @ApiProperty({
    example:
      'This assessment will help evaluate your digital readiness and provide personalized recommendations for your business growth.',
    description: 'Welcome instruction content',
  })
  @IsString()
  welcome_instruction: string;

  @ApiProperty({
    example:
      'This assessment will help evaluate your digital readiness and provide personalized recommendations for your business growth.',
    description: 'Welcome description content',
  })
  @IsOptional()
  @IsString()
  welcome_description?: string;
}

// Module Title DTO
export class CreateModuleTitleDto extends BaseQuestionDto {
  @ApiProperty({ enum: [QuestionType.MODULE_TITLE] })
  @IsEnum([QuestionType.MODULE_TITLE])
  type: QuestionType.MODULE_TITLE;

  @ApiProperty({
    example: 'Digital Skills Assessment',
    description: 'Title of the module',
  })
  @IsString()
  module_title: string;

  @ApiProperty({
    example:
      'In this section, we will evaluate your current digital skills and capabilities.',
    required: false,
  })
  @IsOptional()
  @IsString()
  module_description?: string;
}

// Enhanced Option DTO with points
export class QuestionOptionDto {
  @ApiProperty({ example: 'opt-1' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Beginner Level' })
  @IsString()
  text: string;

  @ApiProperty({
    example: 2,
    description: 'Points awarded when this option is selected',
  })
  @IsNumber()
  @Min(0)
  points: number;

  @ApiProperty({
    example: 'Basic understanding, requires significant support',
    required: false,
    description: 'Optional description of what this points level means',
  })
  @IsOptional()
  @IsString()
  points_description?: string;
}

// Multiple Choice Question DTO
export class CreateMultipleChoiceQuestionDto extends BaseQuestionDto {
  @ApiProperty({ enum: [QuestionType.MULTIPLE_CHOICE] })
  @IsEnum([QuestionType.MULTIPLE_CHOICE])
  type: QuestionType.MULTIPLE_CHOICE;

  @ApiProperty({
    type: [QuestionOptionDto],
    example: [
      {
        id: 'opt-1',
        text: 'Beginner - Basic computer skills',
        points: 1,
        points_description:
          'Needs comprehensive digital transformation support',
      },
      {
        id: 'opt-2',
        text: 'Intermediate - Comfortable with most tools',
        points: 3,
        points_description: 'Ready for intermediate digital solutions',
      },
      {
        id: 'opt-3',
        text: 'Advanced - Proficient with complex tools',
        points: 5,
        points_description: 'Can implement advanced digital strategies',
      },
      {
        id: 'opt-4',
        text: 'Expert - Can teach others',
        points: 7,
        points_description: 'Suitable for leadership in digital transformation',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options: QuestionOptionDto[];
}

export class CreateFileUploadQuestionDTO extends BaseQuestionDto {
  @ApiProperty({ enum: [QuestionType.FILE_UPLOAD] })
  @IsEnum([QuestionType.FILE_UPLOAD])
  type: QuestionType.FILE_UPLOAD;

  @ApiProperty({
    description: 'Allowed file types for upload (file_upload type only)',
    example: ['application/pdf', 'image/jpeg', 'image/png'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowed_file_types?: string[];

  @ApiProperty({
    description: 'Maximum file size in MB (file_upload type only)',
    example: 5,
    minimum: 0.1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(100)
  max_file_size?: number;

  @ApiProperty({
    description: 'Minimum number of files required (file_upload type only)',
    example: 1,
    minimum: 0,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  min_files?: number;

  @ApiProperty({
    description: 'Maximum number of files allowed (file_upload type only)',
    example: 3,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  max_files?: number;

  @ApiProperty({
    description: 'Instructions for file upload (file_upload type only)',
    example:
      'Please upload clear, legible documents in PDF or image format. Maximum 5MB per file.',
  })
  @IsOptional()
  @IsString()
  upload_instructions?: string;
}

// Checkbox Question DTO (Multiple selections allowed)
export class CreateCheckboxQuestionDto extends BaseQuestionDto {
  @ApiProperty({ enum: [QuestionType.CHECKBOX] })
  @IsEnum([QuestionType.CHECKBOX])
  type: QuestionType.CHECKBOX;

  @ApiProperty({
    type: [QuestionOptionDto],
    example: [
      {
        id: 'opt-1',
        text: 'Microsoft Office Suite',
        points: 2,
        points_description: 'Basic productivity tools',
      },
      {
        id: 'opt-2',
        text: 'Google Workspace',
        points: 2,
        points_description: 'Cloud-based collaboration tools',
      },
      {
        id: 'opt-3',
        text: 'Project Management Tools (Trello, Asana)',
        points: 3,
        points_description: 'Advanced organization and workflow tools',
      },
      {
        id: 'opt-4',
        text: 'CRM Software',
        points: 4,
        points_description: 'Customer relationship management systems',
      },
      {
        id: 'opt-5',
        text: 'Social Media Management Tools',
        points: 3,
        points_description: 'Digital marketing automation',
      },
      {
        id: 'opt-6',
        text: 'Video Conferencing Tools',
        points: 2,
        points_description: 'Remote communication platforms',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options: QuestionOptionDto[];

  @ApiProperty({
    example: 2,
    required: false,
    description: 'Minimum selections required',
  })
  @IsOptional()
  @IsNumber()
  min_selections?: number;

  @ApiProperty({
    example: 5,
    required: false,
    description: 'Maximum selections allowed',
  })
  @IsOptional()
  @IsNumber()
  max_selections?: number;

  @ApiProperty({
    example: 'sum',
    enum: ['sum', 'average', 'max'],
    default: 'sum',
    description: 'How to calculate points when multiple options are selected',
  })
  @IsOptional()
  @IsString()
  scoring_method?: 'sum' | 'average' | 'max';
}

// Short Text Question DTO - Text questions can have points based on response analysis
export class CreateShortTextQuestionDto extends BaseQuestionDto {
  @ApiProperty({ enum: [QuestionType.SHORT_TEXT] })
  @IsEnum([QuestionType.SHORT_TEXT])
  type: QuestionType.SHORT_TEXT;

  @ApiProperty({ example: 'Enter your business name', required: false })
  @IsOptional()
  @IsString()
  placeholder?: string;

  @ApiProperty({
    example: 100,
    default: 100,
    description: 'Maximum character limit',
  })
  @IsOptional()
  @IsNumber()
  max_character?: number;

  @ApiProperty({
    example: 2,
    required: false,
    description: 'Minimum character limit',
  })
  @IsOptional()
  @IsNumber()
  min_character?: number;

  @ApiProperty({
    example: 5,
    required: false,
    description: 'Default points awarded for completing this text question',
  })
  @IsOptional()
  @IsNumber()
  completion_points?: number;
}

// Long Text Question DTO
export class CreateLongTextQuestionDto extends BaseQuestionDto {
  @ApiProperty({ enum: [QuestionType.LONG_TEXT] })
  @IsEnum([QuestionType.LONG_TEXT])
  type: QuestionType.LONG_TEXT;

  @ApiProperty({
    example:
      'Describe your digital transformation goals and challenges in detail...',
    required: false,
  })
  @IsOptional()
  @IsString()
  placeholder?: string;

  @ApiProperty({
    example: 1000,
    default: 1000,
    description: 'Maximum character limit',
  })
  @IsOptional()
  @IsNumber()
  max_character?: number;

  @ApiProperty({
    example: 50,
    required: false,
    description: 'Minimum character limit',
  })
  @IsOptional()
  @IsNumber()
  min_character?: number;

  @ApiProperty({
    example: 5,
    default: 3,
    description: 'Minimum number of rows for textarea',
  })
  @IsOptional()
  @IsNumber()
  rows?: number;

  @ApiProperty({
    example: 10,
    required: false,
    description: 'Points awarded for completing this long text question',
  })
  @IsOptional()
  @IsNumber()
  completion_points?: number;

  @ApiProperty({
    type: 'array',
    example: [
      { keyword: 'automation', points: 3 },
      { keyword: 'AI', points: 5 },
      { keyword: 'cloud', points: 4 },
    ],
    required: false,
    description: 'Bonus points awarded for mentioning specific keywords',
  })
  @IsOptional()
  @IsArray()
  keyword_scoring?: { keyword: string; points: number }[];
}

// Dropdown Question DTO
export class CreateDropdownQuestionDto extends BaseQuestionDto {
  @ApiProperty({ enum: [QuestionType.DROPDOWN] })
  @IsEnum([QuestionType.DROPDOWN])
  type: QuestionType.DROPDOWN;

  @ApiProperty({
    type: [QuestionOptionDto],
    example: [
      {
        id: 'opt-1',
        text: 'Technology & Software',
        points: 5,
        points_description: 'High digital readiness expected',
      },
      {
        id: 'opt-2',
        text: 'Healthcare & Medical',
        points: 3,
        points_description: 'Moderate digital adoption',
      },
      {
        id: 'opt-3',
        text: 'Education & Training',
        points: 4,
        points_description: 'Growing digital transformation needs',
      },
      {
        id: 'opt-4',
        text: 'Finance & Banking',
        points: 5,
        points_description: 'High digital security and compliance needs',
      },
      {
        id: 'opt-5',
        text: 'Manufacturing',
        points: 2,
        points_description: 'Traditional industry with emerging digital needs',
      },
      {
        id: 'opt-6',
        text: 'Retail & E-commerce',
        points: 4,
        points_description: 'Digital-first industry requirements',
      },
      {
        id: 'opt-7',
        text: 'Agriculture',
        points: 1,
        points_description: 'Early-stage digital transformation sector',
      },
      {
        id: 'opt-8',
        text: 'Other',
        points: 3,
        points_description: 'General digital transformation approach',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options: QuestionOptionDto[];

  @ApiProperty({ example: 'Select your industry', required: false })
  @IsOptional()
  @IsString()
  placeholder?: string;
}

// Enhanced Grid Column DTO with points
export class GridColumnDto {
  @ApiProperty({ example: 'col-1' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Strongly Agree' })
  @IsString()
  text: string;

  @ApiProperty({
    example: 5,
    description: 'Points awarded when this column is selected',
  })
  @IsNumber()
  @Min(0)
  points: number;

  @ApiProperty({
    example: 'Excellent digital maturity',
    required: false,
    description: 'Description of what this points level represents',
  })
  @IsOptional()
  @IsString()
  points_description?: string;
}

export class GridRowDto {
  @ApiProperty({ example: 'row-1' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'I am comfortable using digital tools' })
  @IsString()
  text: string;

  @ApiProperty({
    example: 2,
    required: false,
    description: 'Weight multiplier for this row (default: 1)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  weight?: number;
}

export class CreateMultipleChoiceGridQuestionDto extends BaseQuestionDto {
  @ApiProperty({ enum: [QuestionType.MULTIPLE_CHOICE_GRID] })
  @IsEnum([QuestionType.MULTIPLE_CHOICE_GRID])
  type: QuestionType.MULTIPLE_CHOICE_GRID;

  @ApiProperty({
    type: [GridColumnDto],
    example: [
      {
        id: 'col-1',
        text: 'Not Digitized',
        points: 1,
        points_description: 'Manual processes only',
      },
      {
        id: 'col-2',
        text: 'Basic Digital Tools',
        points: 2,
        points_description: 'Simple digital tools in use',
      },
      {
        id: 'col-3',
        text: 'Integrated Systems',
        points: 4,
        points_description: 'Connected digital systems',
      },
      {
        id: 'col-4',
        text: 'Advanced Analytics',
        points: 6,
        points_description: 'Data-driven decision making',
      },
      {
        id: 'col-5',
        text: 'AI-Powered Optimization',
        points: 8,
        points_description: 'Cutting-edge digital transformation',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GridColumnDto)
  grid_columns: GridColumnDto[];

  @ApiProperty({
    type: [GridRowDto],
    example: [
      {
        id: 'row-1',
        text: 'Customer relationship management',
        weight: 1.5,
      },
      {
        id: 'row-2',
        text: 'Sales and marketing processes',
        weight: 1.2,
      },
      {
        id: 'row-3',
        text: 'Financial management and reporting',
        weight: 1.3,
      },
      {
        id: 'row-4',
        text: 'Inventory and supply chain management',
        weight: 1.0,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GridRowDto)
  grid_rows: GridRowDto[];
}

// Service Recommendation DTO
export class ServiceRecommendationDto {
  @ApiProperty({
    example: 'basic_digital_transformation',
    description:
      'Must match an existing service ID (leave blank to auto-generate from service_name)',
  })
  @IsOptional()
  @IsString()
  service_id?: string;

  @ApiProperty({
    example: 'Basic Digital Transformation Package',
    description:
      'Must exactly match the name of an existing service in the services catalog',
  })
  @IsString()
  service_name: string;

  @ApiProperty({
    example: 'Perfect for businesses just starting their digital journey',
    description:
      'Assessment-specific description for how this service relates to the score range',
  })
  @IsString()
  description: string;

  //above: added by opeyemi

  @ApiProperty({ example: 15 })
  @IsNumber()
  min_points: number;

  @ApiProperty({ example: 35 })
  @IsNumber()
  max_points: number;

  @ApiProperty({
    example: ['Beginner', 'Foundational'],
    description: 'Array of recommendation levels this service applies to',
    type: [String],
    enum: Object.values(RecommendationLevel),
  })
  @IsArray()
  @IsEnum(RecommendationLevel, { each: true })
  levels: RecommendationLevel[];
}

// Union type for all question DTOs
export type CreateQuestionDto =
  | CreateWelcomeScreenDto
  | CreateModuleTitleDto
  | CreateMultipleChoiceQuestionDto
  | CreateCheckboxQuestionDto
  | CreateShortTextQuestionDto
  | CreateLongTextQuestionDto
  | CreateDropdownQuestionDto
  | CreateMultipleChoiceGridQuestionDto
  | CreateFileUploadQuestionDTO;

// Module DTO
export class CreateModuleDto {
  @ApiProperty({
    example: 'module-1',
    description: 'Temporary ID for referencing in questions',
  })
  @IsString()
  temp_id: string;

  @ApiProperty({ example: 'Digital Skills Module' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Questions about digital skills', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  order: number;

  @ApiProperty({
    default: false,
    description: 'Set to true to delete this module during update',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  toDelete?: boolean;

  @ApiProperty({
    example: 50,
    required: false,
    description: 'Maximum points possible in this module',
  })
  @IsOptional()
  @IsNumber()
  max_points?: number;
}

// Enhanced Assessment DTO with service recommendations
export class CreateAssessmentDto {
  @ApiProperty({ example: 'Digital Maturity Assessment' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Assess your digital readiness', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'Please answer all questions honestly',
    required: false,
  })
  @IsOptional()
  @IsString()
  instruction?: string;

  @ApiProperty({ type: [CreateModuleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateModuleDto)
  modules: CreateModuleDto[];

  @ApiProperty({
    type: 'array',
    description: 'Array of questions with different types and point values',
    example: [
      {
        type: 'multiple_choice',
        question: 'What is your experience level?',
        options: [
          { id: 'opt-1', text: 'Beginner', points: 1 },
          { id: 'opt-2', text: 'Intermediate', points: 3 },
          { id: 'opt-3', text: 'Advanced', points: 5 },
        ],
        max_points: 5,
        scoring_categories: ['digital_literacy'],
        step: 1,
        module_ref: 'module-1',
      },
    ],
  })
  @IsArray()
  questions: CreateQuestionDto[];

  @ApiProperty({
    type: [ServiceRecommendationDto],
    required: false,
    description: 'Service recommendations based on point ranges',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceRecommendationDto)
  service_recommendations?: ServiceRecommendationDto[];

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

// Response DTO
export class CreateAssessmentResDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data?: {
    assessment: any;
    modules: any[];
    questions: any[];
    service_recommendations?: any[];
  };
}
