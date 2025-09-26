import { ApiProperty } from '@nestjs/swagger';
import { ServicesTypes } from 'src/shared/enums';

export class ServiceResponseDto {
  @ApiProperty({
    description: 'Service unique identifier',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({
    description: 'Service name',
    example: 'Web Development',
  })
  name: string;

  @ApiProperty({
    description: 'The type or category of the service.',
    enum: ServicesTypes,
    example: ServicesTypes.digital_skills_and_training,
  })
  service_type: ServicesTypes;

  @ApiProperty({
    description: 'Service image URL',
    example: 'https://example.com/image.jpg',
  })
  image: string;

  @ApiProperty({
    description: 'Service price',
    example: 1500.0,
  })
  price: number;

  @ApiProperty({
    description: 'Service subtitle',
    example: 'Professional web development services',
  })
  subtitle: string;

  @ApiProperty({
    description: 'Service description',
    example: 'We provide comprehensive web development services...',
  })
  description: string;

  @ApiProperty({
    description: 'Service creation date',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Service last update date',
    example: '2024-01-20T14:45:00Z',
  })
  updatedAt: Date;
}
