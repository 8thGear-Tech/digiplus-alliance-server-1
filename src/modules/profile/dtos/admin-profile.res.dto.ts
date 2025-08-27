import { ApiProperty, PartialType } from '@nestjs/swagger';
import { AdminProfileBaseDto } from './admin.dto';

export class AdminProfileResDto extends PartialType(AdminProfileBaseDto) {
  @ApiProperty({
    type: String,
    description: 'message',
    example: 'Profile retrieved successfully',
  })
  message: string;

  @ApiProperty({ type: String, description: 'Request status', example: true })
  success: boolean;
}
