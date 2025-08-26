import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendEmailCodeReqDto {
  @ApiProperty({
    example: 'hello@gmail.com',
    description: 'Email address of the user',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password-reset',
    description:
      'OTP type for email verification e.g registration or password-reset',
    enum: ['registration', 'password-reset'],
  })
  @IsNotEmpty()
  otpFor: string;
}

export class ResendEmailCodeRes {
  @ApiProperty({
    example: 'Email code sent successfully',
  })
  message: string;

  @ApiProperty({
    example: true,
  })
  success: boolean;
}
