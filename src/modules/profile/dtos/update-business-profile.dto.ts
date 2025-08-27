import { PartialType } from '@nestjs/swagger';
import { BusinessOwnerProfileBaseDto } from './business-owner.dto';

export class UpdateBusinessProfileDto extends PartialType(
  BusinessOwnerProfileBaseDto,
) {}
