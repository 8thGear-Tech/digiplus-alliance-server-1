import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class BusinessOwnerProfileBaseDto {
  @ApiProperty({
    type: String,
    description: 'The name of the organization',
    example: 'DigiPlus Alliance',
    required: true,
  })
  @IsNotEmpty({ message: 'Business Owner Name is required' })
  business_name: string;

  @ApiProperty({
    type: String,
    description: 'The industry of the business',
    required: true,
    example: 'Information Technology',
  })
  @IsNotEmpty({ message: 'Industry is required' })
  industry: string;

  @ApiProperty({
    type: String,
    description: 'The official email of the business',
    required: true,
    example: 'hello@digiplus.africa',
  })
  @IsNotEmpty({ message: 'Company Email is required' })
  email: string;

  @ApiProperty({
    type: String,
    description: 'The phone number of the organization',
    required: true,
    example: '+1-800-555-1234',
  })
  @IsNotEmpty({ message: 'Phone Number is required' })
  phone_number: string;

  @ApiProperty({
    type: String,
    description: 'The website of the organization',
    required: false,
    example: 'https://www.digiplus.africa',
  })
  @IsOptional()
  company_website: string;

  @ApiProperty({
    type: String,
    description: 'The address of the organization',
    required: true,
    example: '11 Collin Onabule',
  })
  @IsNotEmpty({ message: 'Company Address is required' })
  company_address: string;

  @ApiProperty({
    type: String,
    description: 'The city of the organization',
    required: true,
    example: 'Ikeja',
  })
  @IsNotEmpty({ message: 'City is required' })
  city: string;

  @ApiProperty({
    type: String,
    description: 'The state of the organization',
    required: true,
    example: 'Lagos State',
  })
  @IsNotEmpty({ message: 'State is required' })
  state: string;

  @ApiProperty({
    type: String,
    description: 'The country of the organization',
    required: true,
    example: 'Nigeria',
  })
  @IsNotEmpty({ message: 'Country is required' })
  country: string;
}
