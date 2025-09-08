import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNumber,
  IsEnum,
  // MinLength,
  // MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '../enums/question-type.enum';

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

  @ApiProperty({ example: 10, default: 0 })
  @IsOptional()
  @IsNumber()
  required_score?: number;

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
    description: 'Welcome message content',
  })
  @IsString()
  welcome_message: string;

  @ApiProperty({ example: 'Start Assessment', required: false })
  @IsOptional()
  @IsString()
  button_text?: string;
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

// Option DTO for questions with options
export class QuestionOptionDto {
  @ApiProperty({ example: 'opt-1' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Beginner Level' })
  @IsString()
  text: string;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  value?: number;
}

// Multiple Choice Question DTO
export class CreateMultipleChoiceQuestionDto extends BaseQuestionDto {
  @ApiProperty({ enum: [QuestionType.MULTIPLE_CHOICE] })
  @IsEnum([QuestionType.MULTIPLE_CHOICE])
  type: QuestionType.MULTIPLE_CHOICE;

  @ApiProperty({
    type: [QuestionOptionDto],
    example: [
      { id: 'opt-1', text: 'Beginner - Basic computer skills', value: 1 },
      {
        id: 'opt-2',
        text: 'Intermediate - Comfortable with most tools',
        value: 2,
      },
      {
        id: 'opt-3',
        text: 'Advanced - Proficient with complex tools',
        value: 3,
      },
      { id: 'opt-4', text: 'Expert - Can teach others', value: 4 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options: QuestionOptionDto[];
}

// Checkbox Question DTO (Multiple selections allowed)
export class CreateCheckboxQuestionDto extends BaseQuestionDto {
  @ApiProperty({ enum: [QuestionType.CHECKBOX] })
  @IsEnum([QuestionType.CHECKBOX])
  type: QuestionType.CHECKBOX;

  @ApiProperty({
    type: [QuestionOptionDto],
    example: [
      { id: 'opt-1', text: 'Microsoft Office Suite', value: 1 },
      { id: 'opt-2', text: 'Google Workspace', value: 1 },
      {
        id: 'opt-3',
        text: 'Project Management Tools (Trello, Asana)',
        value: 1,
      },
      { id: 'opt-4', text: 'CRM Software', value: 1 },
      { id: 'opt-5', text: 'Social Media Management Tools', value: 1 },
      { id: 'opt-6', text: 'Video Conferencing Tools', value: 1 },
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
}

// Short Text Question DTO
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
  max_length?: number;

  @ApiProperty({
    example: 2,
    required: false,
    description: 'Minimum character limit',
  })
  @IsOptional()
  @IsNumber()
  min_length?: number;
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
  max_length?: number;

  @ApiProperty({
    example: 50,
    required: false,
    description: 'Minimum character limit',
  })
  @IsOptional()
  @IsNumber()
  min_length?: number;

  @ApiProperty({
    example: 5,
    default: 3,
    description: 'Minimum number of rows for textarea',
  })
  @IsOptional()
  @IsNumber()
  rows?: number;
}

// Dropdown Question DTO
export class CreateDropdownQuestionDto extends BaseQuestionDto {
  @ApiProperty({ enum: [QuestionType.DROPDOWN] })
  @IsEnum([QuestionType.DROPDOWN])
  type: QuestionType.DROPDOWN;

  @ApiProperty({
    type: [QuestionOptionDto],
    example: [
      { id: 'opt-1', text: 'Technology', value: 1 },
      { id: 'opt-2', text: 'Healthcare', value: 2 },
      { id: 'opt-3', text: 'Education', value: 3 },
      { id: 'opt-4', text: 'Finance', value: 4 },
      { id: 'opt-5', text: 'Manufacturing', value: 5 },
      { id: 'opt-6', text: 'Retail', value: 6 },
      { id: 'opt-7', text: 'Agriculture', value: 7 },
      { id: 'opt-8', text: 'Other', value: 8 },
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

// Grid Question DTO
export class GridColumnDto {
  @ApiProperty({ example: 'col-1' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Strongly Agree' })
  @IsString()
  text: string;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsNumber()
  value?: number;
}

export class GridRowDto {
  @ApiProperty({ example: 'row-1' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'I am comfortable using digital tools' })
  @IsString()
  text: string;
}

export class CreateMultipleChoiceGridQuestionDto extends BaseQuestionDto {
  @ApiProperty({ enum: [QuestionType.MULTIPLE_CHOICE_GRID] })
  @IsEnum([QuestionType.MULTIPLE_CHOICE_GRID])
  type: QuestionType.MULTIPLE_CHOICE_GRID;

  @ApiProperty({
    type: [GridColumnDto],
    example: [
      { id: 'col-1', text: 'Never', value: 1 },
      { id: 'col-2', text: 'Rarely', value: 2 },
      { id: 'col-3', text: 'Sometimes', value: 3 },
      { id: 'col-4', text: 'Often', value: 4 },
      { id: 'col-5', text: 'Always', value: 5 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GridColumnDto)
  grid_columns: GridColumnDto[];

  @ApiProperty({
    type: [GridRowDto],
    example: [
      { id: 'row-1', text: 'I use digital tools for customer communication' },
      { id: 'row-2', text: 'I use digital tools for inventory management' },
      { id: 'row-3', text: 'I use digital tools for financial tracking' },
      { id: 'row-4', text: 'I use digital tools for marketing' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GridRowDto)
  grid_rows: GridRowDto[];
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
  | CreateMultipleChoiceGridQuestionDto;

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
}

// Assessment DTO
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
    description: 'Array of questions with different types',
    example: [
      {
        type: 'welcome_screen',
        question: 'Welcome to Digital Assessment',
        welcome_title: 'Digital Maturity Assessment',
        welcome_message:
          'This assessment will help evaluate your digital readiness.',
        step: 1,
        module_ref: 'module-1',
      },
      {
        type: 'multiple_choice',
        question: 'What is your experience level?',
        options: [
          { id: 'opt-1', text: 'Beginner', value: 1 },
          { id: 'opt-2', text: 'Intermediate', value: 2 },
        ],
        step: 2,
        module_ref: 'module-1',
      },
    ],
  })
  @IsArray()
  questions: CreateQuestionDto[];

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
  };
}

// Example request bodies for Swagger documentation
export class WelcomeScreenExample {
  @ApiProperty({
    example: {
      type: 'welcome_screen',
      question: 'Welcome Screen',
      welcome_title: 'Digital Maturity Assessment',
      welcome_message:
        'Welcome! This comprehensive assessment will help us understand your current digital capabilities and provide personalized recommendations for your business growth. The assessment takes approximately 10-15 minutes to complete.',
      button_text: 'Start Assessment',
      step: 1,
      module_ref: 'intro-module',
      is_active: true,
    },
  })
  example: CreateWelcomeScreenDto;
}

export class ModuleTitleExample {
  @ApiProperty({
    example: {
      type: 'module_title',
      question: 'Module Introduction',
      module_title: 'Digital Skills & Tools',
      module_description:
        'In this section, we will assess your familiarity and comfort level with various digital tools and technologies.',
      step: 2,
      module_ref: 'module-1',
      is_active: true,
    },
  })
  example: CreateModuleTitleDto;
}

export class MultipleChoiceExample {
  @ApiProperty({
    example: {
      type: 'multiple_choice',
      question: 'What best describes your current level of digital tool usage?',
      description:
        'Select the option that most accurately reflects your current situation',
      instruction: 'Choose only one option',
      options: [
        {
          id: 'opt-1',
          text: 'Minimal - I use basic tools like email and web browsing',
          value: 1,
        },
        {
          id: 'opt-2',
          text: 'Basic - I use office applications and some online tools',
          value: 2,
        },
        {
          id: 'opt-3',
          text: 'Intermediate - I use various digital tools for business operations',
          value: 3,
        },
        {
          id: 'opt-4',
          text: 'Advanced - I integrate multiple digital solutions effectively',
          value: 4,
        },
        {
          id: 'opt-5',
          text: 'Expert - I lead digital transformation initiatives',
          value: 5,
        },
      ],
      is_required: true,
      step: 3,
      required_score: 0,
      module_ref: 'module-1',
    },
  })
  example: CreateMultipleChoiceQuestionDto;
}

export class CheckboxExample {
  @ApiProperty({
    example: {
      type: 'checkbox',
      question:
        'Which digital tools do you currently use in your business? (Select all that apply)',
      description: 'Check all the tools you actively use',
      instruction: 'You can select multiple options',
      options: [
        {
          id: 'opt-1',
          text: 'Email marketing tools (Mailchimp, Constant Contact)',
          value: 1,
        },
        {
          id: 'opt-2',
          text: 'Social media management (Hootsuite, Buffer)',
          value: 1,
        },
        {
          id: 'opt-3',
          text: 'Customer relationship management (CRM)',
          value: 1,
        },
        {
          id: 'opt-4',
          text: 'E-commerce platforms (Shopify, WooCommerce)',
          value: 1,
        },
        {
          id: 'opt-5',
          text: 'Accounting software (QuickBooks, Xero)',
          value: 1,
        },
        {
          id: 'opt-6',
          text: 'Project management tools (Trello, Asana)',
          value: 1,
        },
        { id: 'opt-7', text: 'Video conferencing (Zoom, Teams)', value: 1 },
        {
          id: 'opt-8',
          text: 'Cloud storage (Google Drive, Dropbox)',
          value: 1,
        },
      ],
      min_selections: 1,
      max_selections: 8,
      step: 4,
      module_ref: 'module-1',
    },
  })
  example: CreateCheckboxQuestionDto;
}

export class ShortTextExample {
  @ApiProperty({
    example: {
      type: 'short_text',
      question: 'What is the name of your business?',
      description: 'Please enter your business or organization name',
      placeholder: 'e.g., ABC Marketing Solutions',
      max_length: 100,
      min_length: 2,
      is_required: true,
      step: 5,
      module_ref: 'module-1',
    },
  })
  example: CreateShortTextQuestionDto;
}

export class LongTextExample {
  @ApiProperty({
    example: {
      type: 'long_text',
      question: 'Describe your biggest challenges with digital transformation',
      description:
        'Please provide specific examples and explain how these challenges impact your business',
      instruction: 'Write at least 3-4 sentences with specific examples',
      placeholder:
        'e.g., Our team struggles with adopting new software because of limited training time and resistance to change. We also face budget constraints when investing in new technologies...',
      max_length: 1000,
      min_length: 50,
      rows: 5,
      is_required: true,
      step: 6,
      module_ref: 'module-2',
    },
  })
  example: CreateLongTextQuestionDto;
}

export class DropdownExample {
  @ApiProperty({
    example: {
      type: 'dropdown',
      question: 'What industry does your business primarily operate in?',
      description: 'Select the industry that best matches your business',
      placeholder: 'Select your industry',
      options: [
        { id: 'opt-1', text: 'Technology & Software', value: 1 },
        { id: 'opt-2', text: 'Healthcare & Medical', value: 2 },
        { id: 'opt-3', text: 'Education & Training', value: 3 },
        { id: 'opt-4', text: 'Finance & Banking', value: 4 },
        { id: 'opt-5', text: 'Manufacturing', value: 5 },
        { id: 'opt-6', text: 'Retail & E-commerce', value: 6 },
        { id: 'opt-7', text: 'Professional Services', value: 7 },
        { id: 'opt-8', text: 'Agriculture', value: 8 },
        { id: 'opt-9', text: 'Construction', value: 9 },
        { id: 'opt-10', text: 'Other', value: 10 },
      ],
      is_required: true,
      step: 7,
      module_ref: 'module-2',
    },
  })
  example: CreateDropdownQuestionDto;
}

export class MultipleChoiceGridExample {
  @ApiProperty({
    example: {
      type: 'multiple_choice_grid',
      question:
        'For each business area below, how would you rate your current digital maturity?',
      description:
        'Rate each area based on your current digital adoption and effectiveness',
      instruction: 'Select one option for each row',
      grid_columns: [
        { id: 'col-1', text: 'Not Digitized', value: 1 },
        { id: 'col-2', text: 'Basic Digital Tools', value: 2 },
        { id: 'col-3', text: 'Integrated Systems', value: 3 },
        { id: 'col-4', text: 'Advanced Analytics', value: 4 },
        { id: 'col-5', text: 'AI-Powered Optimization', value: 5 },
      ],
      grid_rows: [
        { id: 'row-1', text: 'Customer relationship management' },
        { id: 'row-2', text: 'Sales and marketing processes' },
        { id: 'row-3', text: 'Financial management and reporting' },
        { id: 'row-4', text: 'Inventory and supply chain management' },
        { id: 'row-5', text: 'Employee communication and collaboration' },
        { id: 'row-6', text: 'Data analysis and decision making' },
      ],
      is_required: true,
      step: 8,
      module_ref: 'module-3',
    },
  })
  example: CreateMultipleChoiceGridQuestionDto;
}
