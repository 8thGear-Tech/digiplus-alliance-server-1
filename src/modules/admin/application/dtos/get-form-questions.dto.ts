// src/modules/admin-application/dtos/get-form-questions.dto.ts

import { IsOptional, IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetFormQuestionsDto {
  @ApiProperty({
    description: 'An array of application form IDs to retrieve questions from.',
    example: ['654c6a654c6a4654c6a654c6a', '654d7b76d7c75765d7c77654'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  formIds?: string[];
}
