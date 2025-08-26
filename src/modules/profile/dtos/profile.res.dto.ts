import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBusinessOwnerProfileDto } from './business-owner.dto';

export class ProfileResDto extends PartialType(CreateBusinessOwnerProfileDto) {
  @ApiProperty({
    type: String,
    description: 'message',
    example: 'Profile created successfully',
  })
  message: string;

  @ApiProperty({ type: String, description: 'Request status', example: true })
  success: boolean;

  @ApiProperty({
    type: String,
    description: 'Additional information message',
    example:
      'The following accounts already exist: holla@gmail.com, hello@gmail.com',
  })
  additional_message?: string;
}
