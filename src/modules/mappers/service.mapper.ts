/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ServiceDocument } from './../admin/services/schemas/service.schema';
import { ServiceResponseDto } from './../admin/services/dto/service-response.dto';

export function toServiceResponseDto(doc: ServiceDocument): ServiceResponseDto {
  return {
    _id: (doc._id as string | { toString(): string }).toString(),
    name: doc.name,
    image: doc.image,
    price: doc.price,
    subtitle: doc.subtitle,
    description: doc.description,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
