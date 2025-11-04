// dto/update-assessment.dto.ts

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
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '../enums/question-type.enum';
import { RecommendationLevel } from '../enums/recommendation-level.enum';

// Simplified Update Question Option DTO
export class UpdateQuestionOptionDto {
  @ApiProperty({ example: 'opt-1', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: 'Beginner Level', required: false })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  points?: number;

  @ApiProperty({ example: 'Basic understanding', required: false })
  @IsOptional()
  @IsString()
  points_description?: string;
}

// Simplified Update Grid Column DTO
export class UpdateGridColumnDto {
  @ApiProperty({ example: 'col-1', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: 'Strongly Agree', required: false })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  points?: number;

  @ApiProperty({ example: 'Excellent digital maturity', required: false })
  @IsOptional()
  @IsString()
  points_description?: string;
}

// Simplified Update Grid Row DTO
export class UpdateGridRowDto {
  @ApiProperty({ example: 'row-1', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    example: 'I am comfortable using digital tools',
    required: false,
  })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  weight?: number;
}

// Simplified Update Question DTO (flexible for all question types)
export class UpdateQuestionDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439013', required: false })
  @IsOptional()
  @IsMongoId()
  id?: string;

  @ApiProperty({ enum: Object.values(QuestionType), required: false })
  @IsOptional()
  @IsEnum(QuestionType)
  type?: QuestionType;

  @ApiProperty({
    example: 'What is your digital skill level?',
    required: false,
  })
  @IsOptional()
  @IsString()
  question?: string;

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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_required?: boolean;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  step?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  max_points?: number;

  @ApiProperty({ example: '507f1f77bcf86cd799439012', required: false })
  @IsOptional()
  @IsString()
  module_id?: string;

  @ApiProperty({
    example: 'module-1',
    required: false,
    description: 'Reference to module by its temporary ID (for new questions)',
  })
  @IsOptional()
  @IsString()
  module_ref?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({
    example: ['digital_literacy', 'business_tools'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scoring_categories?: string[];

  // Welcome Screen specific fields
  @ApiProperty({ example: 'Welcome to Assessment', required: false })
  @IsOptional()
  @IsString()
  welcome_title?: string;

  @ApiProperty({ example: 'This assessment will help...', required: false })
  @IsOptional()
  @IsString()
  welcome_description?: string;

  @ApiProperty({ example: 'Start Assessment', required: false })
  @IsOptional()
  @IsString()
  button_text?: string;

  // Module Title specific fields
  @ApiProperty({ example: 'Digital Skills Module', required: false })
  @IsOptional()
  @IsString()
  module_title?: string;

  @ApiProperty({ example: 'Assess your digital capabilities', required: false })
  @IsOptional()
  @IsString()
  module_description?: string;

  // Multiple Choice, Checkbox, Dropdown options
  @ApiProperty({ type: [UpdateQuestionOptionDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateQuestionOptionDto)
  options?: UpdateQuestionOptionDto[];

  // Checkbox specific fields
  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  min_selections?: number;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsNumber()
  max_selections?: number;

  @ApiProperty({
    example: 'sum',
    enum: ['sum', 'average', 'max'],
    required: false,
  })
  @IsOptional()
  @IsString()
  scoring_method?: 'sum' | 'average' | 'max';

  // Text questions specific fields
  @ApiProperty({ example: 'Enter your business name', required: false })
  @IsOptional()
  @IsString()
  placeholder?: string;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsNumber()
  max_characters?: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  min_characters?: number;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsNumber()
  completion_points?: number;

  // Long Text specific fields
  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsNumber()
  rows?: number;

  @ApiProperty({
    type: 'array',
    example: [{ keyword: 'automation', points: 3 }],
    required: false,
  })
  @IsOptional()
  @IsArray()
  keyword_scoring?: { keyword: string; points: number }[];

  // Grid specific fields
  @ApiProperty({ type: [UpdateGridColumnDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateGridColumnDto)
  grid_columns?: UpdateGridColumnDto[];

  @ApiProperty({ type: [UpdateGridRowDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateGridRowDto)
  grid_rows?: UpdateGridRowDto[];
}

// Simplified Update Module DTO
export class UpdateModuleDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439012', required: false })
  @IsOptional()
  @IsMongoId()
  id?: string;

  @ApiProperty({ example: 'module-1', required: false })
  @IsOptional()
  @IsString()
  temp_id?: string;

  @ApiProperty({ example: 'Digital Skills Module', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Questions about digital skills', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @IsNumber()
  max_points?: number;
}

// Simplified Update Service Recommendation DTO
export class UpdateServiceRecommendationDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439016', required: false })
  @IsOptional()
  @IsMongoId()
  id?: string;

  @ApiProperty({
    example: 'basic_digital_transformation',
    required: false,
    description:
      'Optional service ID override (will be validated against existing service)',
  })
  @IsOptional()
  @IsString()
  service_id?: string;

  @ApiProperty({
    example: 'Basic Digital Transformation Package',
    required: false,
    description:
      'Must exactly match the name of an existing service in the services catalog',
  })
  @IsOptional()
  @IsString()
  service_name?: string;

  @ApiProperty({
    example: 'Perfect for businesses starting digital journey',
    required: false,
    description:
      'Assessment-specific description for how this service relates to the score range',
  })
  @IsOptional()
  @IsString()
  description?: string;
  //above: added by opeyemi

  @ApiProperty({ example: 15, required: false })
  @IsOptional()
  @IsNumber()
  min_points?: number;

  @ApiProperty({ example: 35, required: false })
  @IsOptional()
  @IsNumber()
  max_points?: number;

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

// Main Update Assessment DTO
export class UpdateAssessmentDto {
  @ApiProperty({
    example: 'Updated Digital Maturity Assessment',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Updated assessment description', required: false })
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

  @ApiProperty({ type: [UpdateModuleDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateModuleDto)
  modules?: UpdateModuleDto[];

  @ApiProperty({
    type: [UpdateQuestionDto],
    required: false,
    description: 'Array of questions to update or add',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateQuestionDto)
  questions?: UpdateQuestionDto[];

  @ApiProperty({ type: [UpdateServiceRecommendationDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateServiceRecommendationDto)
  service_recommendations?: UpdateServiceRecommendationDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

// Response DTO
export class UpdateAssessmentResDto {
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
    updated_items: {
      modules: string[];
      questions: string[];
      service_recommendations: string[];
    };
  };
}
