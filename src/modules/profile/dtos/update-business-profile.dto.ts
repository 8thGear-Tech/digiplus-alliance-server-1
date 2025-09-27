import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { BusinessOwnerProfileBaseDto } from './business-owner.dto';

export class UpdateBusinessProfileDto {
  @ApiProperty({ required: false, type: String, example: 'John' })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty({ required: false, type: String, example: 'Doe' })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Logo file',
  })
  @IsOptional()
  org_logo?: any; // handled by FileInterceptor

  @ApiProperty({
    type: String,
    description: 'The name of the organization',
    example: 'DigiPlus Alliance',
    required: false,
  })
  @IsOptional()
  business_name?: string;

  @ApiProperty({
    type: String,
    description: 'The industry of the business',
    required: false,
    example: 'Information Technology',
  })
  @IsOptional()
  industry?: string;

  @ApiProperty({
    type: String,
    description: 'The official email of the business',
    required: false,
    example: 'hello@digiplus.africa',
  })
  @IsOptional()
  email?: string;

  @ApiProperty({
    type: String,
    description: 'The phone number of the organization',
    required: false,
    example: '+1-800-555-1234',
  })
  @IsOptional()
  phone_number?: string;

  @ApiProperty({
    type: String,
    description: 'The website of the organization',
    required: false,
    example: 'https://www.digiplus.africa',
  })
  @IsOptional()
  company_website?: string;

  @ApiProperty({
    type: String,
    description: 'The address of the organization',
    required: false,
    example: '11 Collin Onabule',
  })
  @IsOptional()
  company_address?: string;

  @ApiProperty({
    type: String,
    description: 'The city of the organization',
    required: false,
    example: 'Ikeja',
  })
  @IsOptional()
  city?: string;

  @ApiProperty({
    type: String,
    description: 'The state of the organization',
    required: false,
    example: 'Lagos State',
  })
  @IsOptional()
  state?: string;

  @ApiProperty({
    type: String,
    description: 'The country of the organization',
    required: false,
    example: 'Nigeria',
  })
  @IsOptional()
  country?: string;
}
