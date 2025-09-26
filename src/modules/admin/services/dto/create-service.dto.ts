import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsPositive,
  Length,
  IsEnum,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ServicesTypes } from 'src/shared/enums';

export class CreateServiceDto {
  @ApiProperty({
    description: 'Service name',
    example: 'Web Development',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Service name is required' })
  @IsString({ message: 'Service name must be a string' })
  @Length(1, 255, {
    message: 'Service name must be between 1 and 255 characters',
  })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'The category or type of the service.',
    enum: ServicesTypes,
    example: ServicesTypes.digital_skills_and_training,
  })
  @IsNotEmpty({ message: 'Service type is required' })
  @IsEnum(ServicesTypes, {
    message: 'Service type must be a valid ServicesTypes enum value.',
  })
  service_type: ServicesTypes;

  @ApiProperty({
    description: 'Service image URL or base64',
    example: 'https://example.com/image.jpg',
  })
  @IsNotEmpty({ message: 'Service image is required' })
  @IsString({ message: 'Service image must be a string' })
  @Transform(({ value }) => value?.trim())
  image: string;

  @ApiProperty({
    description: 'Service price',
    example: 1500.0,
    type: 'number',
  })
  @IsNotEmpty({ message: 'Service price is required' })
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price must be a valid number with up to 2 decimal places' },
  )
  @IsPositive({ message: 'Price must be a positive number' })
  price: number;

  @ApiProperty({
    description: 'Service subtitle',
    example: 'Professional web development services',
    maxLength: 500,
  })
  @IsNotEmpty({ message: 'Service subtitle is required' })
  @IsString({ message: 'Service subtitle must be a string' })
  @Length(1, 500, {
    message: 'Service subtitle must be between 1 and 500 characters',
  })
  @Transform(({ value }) => value?.trim())
  subtitle: string;

  @ApiProperty({
    description: 'Service description',
    example:
      'We provide comprehensive web development services including frontend, backend, and database design.',
  })
  @IsNotEmpty({ message: 'Service description is required' })
  @IsString({ message: 'Service description must be a string' })
  @Transform(({ value }) => value?.trim())
  description: string;
}
