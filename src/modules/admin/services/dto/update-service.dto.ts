import {
  IsString,
  IsNumber,
  IsPositive,
  Length,
  IsEnum,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServicesTypes } from 'src/shared/enums';

export class UpdateServiceDto {
  @ApiPropertyOptional({
    description: 'Service name',
    example: 'Web Development',
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({
    enum: ServicesTypes,
    description: 'Service type/category',
  })
  @IsOptional()
  @IsEnum(ServicesTypes)
  service_type?: ServicesTypes;

  @ApiPropertyOptional({
    description: 'Service base price',
    example: 2000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price?: number;

  @ApiPropertyOptional({
    description: 'Discounted price',
    example: 1500,
  })
  @IsOptional()
  @Transform(({ value }) => {
    console.log('Raw discounted_price value:', value, typeof value);
    if (value === '' || value === null || value === undefined) {
      console.log('Returning undefined');
      return undefined;
    }
    const num = Number(value);
    console.log('Converted to number:', num);
    return num;
  })
  @ValidateIf((o, value) => {
    console.log('ValidateIf check:', value, value !== undefined);
    return value !== undefined;
  })
  @IsNumber()
  @IsPositive()
  discounted_price?: number;

  @ApiPropertyOptional({
    description: 'Short description',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  short_description?: string;

  @ApiPropertyOptional({
    description: 'Detailed description',
  })
  @IsOptional()
  @IsString()
  long_description?: string;

  // NO images property here - files come from @UploadedFiles()
}
