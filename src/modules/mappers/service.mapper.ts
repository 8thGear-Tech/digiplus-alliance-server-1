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
    images: service.images || [],
    product_price: service.product_price,
    discounted_price: service.discounted_price,
    subtitle: service.subtitle,
    short_description: service.short_description,
    long_description: service.long_description,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };
}
