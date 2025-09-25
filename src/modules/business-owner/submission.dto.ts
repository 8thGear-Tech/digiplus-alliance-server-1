// src/modules/user-application/dtos/submission.dto.ts

import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmissionDto {
  @ApiProperty({
    description: 'The user responses for the application form.',
    example: {
      'company-name': 'DigiPlus Alliance',
      firstname: 'John',
      lastname: 'Doe',
      email: 'johndoe@example.com',
      phonenumber: '+2348012345678',
      'reason-for-applying': 'I want to join the digital community.',
    },
  })
  @IsNotEmpty()
  @IsObject()
  responses: Record<string, any>;

  @ApiProperty({
    description: 'The service type selected by the user.',
    example: 'Digital Skills & Training',
  })
  @IsNotEmpty()
  @IsString()
  serviceType: string;

  @ApiProperty({
    description: 'The specific service selected by the user.',
    example: 'Digital Transformation Advisory',
  })
  @IsNotEmpty()
  @IsString()
  service: string;
}
