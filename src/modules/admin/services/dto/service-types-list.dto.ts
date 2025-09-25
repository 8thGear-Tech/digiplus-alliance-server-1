// added by opeyemi
import { ApiProperty } from '@nestjs/swagger';

export class ServiceTypesListDto {
  @ApiProperty({
    description: 'An array of all available service types.',
    example: ['Ecosystem Building', 'Digital Skills & Training'],
  })
  serviceTypes: string[];
}
