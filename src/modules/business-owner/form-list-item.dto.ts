// src/modules/user-application/dtos/form-list-item.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class FormListItemDto {
  @ApiProperty({
    description: 'The unique ID of the application form.',
    example: '654c6a654c6a4654c6a654c6a',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'The title of the application form.',
    example: 'Student Admission Form',
  })
  @IsString()
  welcome_title: string;

  @ApiProperty({
    description: 'A brief description of the form.',
    example: 'This form is for new student admissions.',
  })
  @IsString()
  @IsOptional()
  welcome_description?: string; // Make the property optional
}
