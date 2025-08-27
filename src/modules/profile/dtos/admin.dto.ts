import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsString, IsOptional } from 'class-validator';

export class AdminProfileBaseDto {
  @ApiProperty({
    type: String,
    description: 'The official email of the admin',
    example: 'admin@digiplus.africa',
    required: true,
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail()
  email: string;

  @ApiProperty({
    type: String,
    description: 'The phone number of the admin',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone_number?: string;

  @ApiProperty({
    type: String,
    description: 'The official website of the admin',
    example: 'www.digiplus.africa',
    required: false,
  })
  @IsOptional()
  @IsString()
  website?: string;
}
