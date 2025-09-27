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
    isArray: true,
    type: String,
    description: 'Additional service images',
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
  })
  images: string[];

  //changed by opeyemi
  @ApiProperty({
    description: 'Base product price',
    example: 2000.0,
  })
  price: number;

  @ApiProperty({
    required: false,
    description: 'Discounted price if applicable',
    example: 1800.0,
  })
  discounted_price?: number;

  //changed by opeyemi
  // @ApiProperty({
  //   description: 'Service subtitle',
  //   example: 'Professional web development services',
  // })
  // subtitle: string;

  @ApiProperty({
    required: false,
    description: 'Short description',
    example: 'Expert web development solutions',
  })
  short_description?: string;

  @ApiProperty({
    required: false,
    description: 'Detailed service description',
    example: 'We offer comprehensive web development services including ...',
  })
  long_description?: string;

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
