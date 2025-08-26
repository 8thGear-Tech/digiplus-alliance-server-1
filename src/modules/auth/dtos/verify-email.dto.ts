import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyAccountDto {
  @ApiProperty({ description: 'Verification token', example: '' })
  @IsNotEmpty()
  token: string;
}

export class VerifyEmailRes {
  @ApiProperty({
    example: 'Email verified successfully',
  })
  message: string;

  @ApiProperty({
    example: true,
  })
  success: boolean;
}
