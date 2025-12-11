import { ServiceDocument } from './../admin/services/schemas/service.schema';
import { ServiceResponseDto } from './../admin/services/dto/service-response.dto';
import { CurrencyUtil, PricingUnit } from 'src/shared/enums';

export function toServiceResponse(
  service: ServiceDocument,
): ServiceResponseDto {
  return {
    _id: service._id.toString(),
    name: service.name,
    service_type: service.service_type,
    image: service.image,
    images: service.images || [],
    price: service.price,
    discounted_price: service.discounted_price,
    formatted_discounted_price: service.discounted_price
      ? CurrencyUtil.formatNairaWithUnit(
          service.discounted_price,
          (service.pricing_unit as PricingUnit) || PricingUnit.ONE_TIME_PAYMENT,
        )
      : undefined,
    pricing_unit:
      (service.pricing_unit as PricingUnit) || PricingUnit.ONE_TIME_PAYMENT,
    formatted_price: CurrencyUtil.formatNairaWithUnit(
      service.price,
      (service.pricing_unit as PricingUnit) || PricingUnit.ONE_TIME_PAYMENT,
    ),
    // subtitle: service.subtitle,
    short_description: service.short_description,
    long_description: service.long_description,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };
}
