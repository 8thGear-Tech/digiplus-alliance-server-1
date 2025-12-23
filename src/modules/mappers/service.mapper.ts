import { ServiceDocument } from './../admin/services/schemas/service.schema';
import { ServiceResponseDto } from './../admin/services/dto/service-response.dto';
import { CurrencyUtil, PricingUnit } from 'src/shared/enums';

export function toServiceResponse(
  service: ServiceDocument,
): ServiceResponseDto {
  const pricingUnit = (service.pricing_unit as PricingUnit) || PricingUnit.ONE_TIME_PAYMENT;
  
  // Only equity-based services get special treatment
  const isEquityBased = pricingUnit === PricingUnit.EQUITY_BASED;

  return {
    _id: service._id.toString(),
    name: service.name,
    service_type: service.service_type,
    image: service.image,
    images: service.images || [],
    price: service.price,
    discounted_price: service.discounted_price,
    pricing_unit: pricingUnit,
    
    // Format price or show "Equity-based"
    formatted_price: isEquityBased
      ? 'Equity-based'
      : CurrencyUtil.formatNairaWithUnit(service.price || 0, pricingUnit),
    
    formatted_discounted_price: !isEquityBased && service.discounted_price
      ? CurrencyUtil.formatNairaWithUnit(service.discounted_price, pricingUnit)
      : undefined,
    
    short_description: service.short_description,
    long_description: service.long_description,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };
}