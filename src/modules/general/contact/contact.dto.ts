// ===== 1. Contact DTO (contact.dto.ts) =====
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class ContactDto {
  @ApiProperty({
    description: 'First name of the person contacting',
    example: 'John',
  })
  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  @Transform(({ value }) => value?.trim())
  first_name: string;

  @ApiProperty({
    description: 'Last name of the person contacting',
    example: 'Doe',
  })
  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  @Transform(({ value }) => value?.trim())
  last_name: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({
    description: 'Contact message',
    example: 'I would like to know more about your services.',
  })
  @IsNotEmpty()
  @IsString()
  @Length(10, 1000)
  @Transform(({ value }) => value?.trim())
  message: string;
}

export class ContactResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Thank you for contacting us. We will get back to you soon.',
  })
  message: string;
}
