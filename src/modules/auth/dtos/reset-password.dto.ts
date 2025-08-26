import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResetPasswordReqDto {
  @ApiProperty({
    example: 'Password of the user',
    description: 'Password of the user',
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example:
      'ejhyhdseyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2RlIjoiMzY1OTE4IiwiZW1haWwiOiJhYmR1bHNhbGFtY',
    description: 'Reset token for password reset',
  })
  @IsNotEmpty()
  resetToken: string;
}
