import { PartialType } from '@nestjs/swagger';
import { CreateBusinessOwnerProfileDto } from './business-owner.dto';

export class UpdateProfileDto extends PartialType(
  CreateBusinessOwnerProfileDto,
) {}
