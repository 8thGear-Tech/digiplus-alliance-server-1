// src/modules/user-application/dtos/form-query.dto.ts

import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FormQueryDto {
  @ApiProperty({
    description:
      'The type of service selected by the user (e.g., "Digital Skills & Training")',
    example: 'Digital Skills & Training',
  })
  @IsNotEmpty()
  @IsString()
  serviceType: string;

  @ApiProperty({
    description:
      'The specific service name selected by the user (e.g., "Hub Membership")',
    example: 'Hub Membership',
  })
  @IsNotEmpty()
  @IsString()
  service: string;
}
