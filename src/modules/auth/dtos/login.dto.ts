import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { UserDto } from 'src/modules/user/dto/user.dto';
import { User } from 'src/modules/user/user.schema';

export class LoginReqDto {
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
  password: string;
}

export class LoginResDto {
  @ApiProperty({
    description: 'Message to the user',
    example: 'Login successful',
  })
  message: string;

  @ApiProperty({
    description: 'Access token for the user',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Access token for the user',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'User details',
    type: UserDto,
  })
  user: Partial<User> | null;
}
