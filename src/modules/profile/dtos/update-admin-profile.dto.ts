// src/modules/profile/dtos/update-admin-profile.dto.ts
import { PartialType } from '@nestjs/swagger';
import { AdminProfileBaseDto } from './admin.dto';

export class UpdateAdminProfileDto extends PartialType(AdminProfileBaseDto) {}
