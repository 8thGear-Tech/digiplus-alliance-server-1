import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmissionDto {
  @ApiProperty({
    description: 'The user responses for the application form.',
    example: {
      companyname: 'DigiPlus Alliance',
      firstname: 'John',
      lastname: 'Doe',
      email: 'johndoe@example.com',
      phonenumber: '+2348012345678',
      reasonforapplying: 'I want to join the digital community.',
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
