import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ChangePasswordReqDto {
  @ApiProperty({
    description: 'Current password of the user',
    example: 'MyOldPassword!',
  })
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @ApiProperty({
    description:
      'New password for the user account. Must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one special character.',
    example: 'MyNewPassword!',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'New password is too weak',
  })
  newPassword: string;
}

export class ChangePasswordResDto {
  @ApiProperty({
    example: 'Password changed successfully',
  })
  message: string;

  @ApiProperty({
    example: true,
  })
  success: boolean;
}
