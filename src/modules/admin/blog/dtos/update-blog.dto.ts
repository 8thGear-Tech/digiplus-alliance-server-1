import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsBoolean,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateBlogDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isPublished?: boolean;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  tags?: string | string[];

  @ApiProperty({
    type: [String],
    required: false,
    description: 'URLs for the featured images',
  })
  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  featuredImageUrls?: string[];

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
    description: 'Featured image file uploads',
  })
  featuredImageFiles?: any[];
}
