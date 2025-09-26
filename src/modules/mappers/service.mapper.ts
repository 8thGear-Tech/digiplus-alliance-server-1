import { ServiceDocument } from './../admin/services/schemas/service.schema';
import { ServiceResponseDto } from './../admin/services/dto/service-response.dto';

export function toServiceResponse(
  service: ServiceDocument,
): ServiceResponseDto {
  return {
    _id: service._id.toString(),
    name: service.name,
    service_type: service.service_type,
    image: service.image,
    price: service.price,
    subtitle: service.subtitle,
    description: service.description,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };
}
