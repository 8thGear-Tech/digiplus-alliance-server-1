import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmissionDto {
  @ApiProperty({
    description: 'The user responses for the application form.',
    example: {
      company_name: 'DigiPlus Alliance',
      first_name: 'John',
      last_name: 'Doe',
      email: 'johndoe@example.com',
      phone_number: '+2348012345678',
      reason_for_applying: 'I want to join the digital community.',
    },
  })
  @IsNotEmpty()
  @IsObject()
  responses: Record<string, any>;

  @ApiProperty({
    description: 'The specific service selected by the user.',
    example: 'Digital Transformation Advisory',
  })
  @IsNotEmpty()
  @IsString()
  service: string;
}
