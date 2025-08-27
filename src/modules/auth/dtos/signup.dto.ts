import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignupReqDto {
  @ApiProperty({ description: 'First name of the user', example: 'Smith' })
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiProperty({ description: 'last name of the user', example: 'Brown' })
  @IsNotEmpty()
  @IsString()
  last_name: string;

  @ApiProperty({ description: 'business name', example: 'DigiPlus Alliance' })
  @IsOptional()
  @IsString()
  business_name: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'hello@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'Password for the user account. Must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one special character.',
    example: 'MyPassword!',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak',
  })
  password: string;

  @ApiProperty({
    description: 'Account type of the user. ',
    example: 'business_owner',
    enum: ['admin', 'business_owner'],
  })
  @IsString()
  @IsNotEmpty()
  role: string;
}

export class SignupResDto {
  @ApiProperty({
    example: 'User account created successfully',
  })
  message: string;

  @ApiProperty({
    example: true,
  })
  success: boolean;
}
