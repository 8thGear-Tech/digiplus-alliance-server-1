import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class PublishFormDto {
  @ApiProperty({
    example: true,
    description:
      'The publish status of the form. `true` to publish, `false` to unpublish.',
  })
  @IsNotEmpty()
  @IsBoolean()
  isLive: boolean;
}
