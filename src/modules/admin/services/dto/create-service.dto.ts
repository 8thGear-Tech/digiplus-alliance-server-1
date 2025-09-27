/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsPositive,
  Length,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ServicesTypes } from 'src/shared/enums';

export class CreateServiceDto {
  @ApiProperty({
    description: 'Service name',
    example: 'Web Development',
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 255)
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({ enum: ServicesTypes })
  @IsEnum(ServicesTypes)
  service_type: ServicesTypes;

  @ApiProperty({ description: 'Main service image URL or base64' })
  @IsNotEmpty()
  @IsString()
  image: string;

  @ApiProperty({
    description: 'Additional images',
    isArray: true,
    type: String,
    required: false,
  })
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ description: 'Service base price', example: 2000 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  product_price: number;

  @ApiProperty({
    description: 'Discounted price',
    example: 1500,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  discounted_price?: number;

  @ApiProperty({ description: 'Short description', maxLength: 500 })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  short_description?: string;

  @ApiProperty({ description: 'Detailed description' })
  @IsOptional()
  @IsString()
  long_description?: string;

  @ApiProperty({ description: 'Subtitle' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 500)
  subtitle: string;
}
