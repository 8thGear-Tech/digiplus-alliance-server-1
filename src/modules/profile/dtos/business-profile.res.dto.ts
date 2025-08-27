import { ApiProperty, PartialType } from '@nestjs/swagger';
import { BusinessOwnerProfileBaseDto } from './business-owner.dto';

export class BusinessProfileResDto extends PartialType(
  BusinessOwnerProfileBaseDto,
) {
  @ApiProperty({
    type: String,
    description: 'message',
    example: 'Profile created successfully',
  })
  message: string;

  @ApiProperty({ type: String, description: 'Request status', example: true })
  success: boolean;
}
