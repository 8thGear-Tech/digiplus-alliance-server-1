/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ServiceDocument } from './../admin/services/schemas/service.schema';
import { ServiceResponseDto } from './../admin/services/dto/service-response.dto';

export function toServiceResponse(
  service: ServiceDocument,
): ServiceResponseDto {
  return {
    _id: service._id.toString(),
    name: service.name,
    image: service.image,
    price: service.price,
    subtitle: service.subtitle,
    description: service.description,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };
}
