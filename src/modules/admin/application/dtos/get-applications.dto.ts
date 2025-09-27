import { IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ServicesTypes } from 'src/shared/enums';

export class GetApplicationsDto {
  @ApiProperty({
    enum: ServicesTypes,
    example: ServicesTypes.digital_skills_and_training,
    description: 'Optional filter to fetch applications by service type.',
    required: false,
  })
  @IsOptional()
  @IsEnum(ServicesTypes)
  service_type?: ServicesTypes;
}
