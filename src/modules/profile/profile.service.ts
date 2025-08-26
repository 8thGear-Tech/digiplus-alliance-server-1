import { Inject, Injectable } from '@nestjs/common';
import { CreateBusinessOwnerProfileDto } from './dtos/business-owner.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { BaseRepository } from '../repository/base.repository';
import {
  BusinessProfile,
  BusinessProfileSchema,
} from './schemas/business.owner.schema';
import { Identifier } from 'src/shared/types';
import { Types } from 'mongoose';
import { BadRequestException } from 'src/exceptions';
import { UploadService } from '../cloudinary/cloudinary.service';
import { User } from '../user/user.schema';
import { Constants } from 'src/shared/constants';
import * as bcrypt from 'bcryptjs';
import {
  DatabaseModelNames,
  NotificationTypes,
  Repositories,
  UserTypes,
} from 'src/shared/enums';
import { MailerService } from '../mailer/mailer.service';
// import { Notification } from '../general/schemas/notification.schema';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ProfileService {
  constructor(
    @Inject(Repositories.BusinessOwnerRepository)
    private readonly businessProfileRepository: BaseRepository<BusinessProfile>,
    @Inject(Repositories.UserRepository)
    private readonly userRepository: BaseRepository<User>,
    // @Inject(Repositories.NotificationRepository)
    // private readonly notificationRepository: BaseRepository<Notification>,
    // private readonly mailService: MailerService,
    private readonly uploadService: UploadService,
    // private readonly jwtService: JwtService,
  ) {}

  async createBusinessProfile(
    businessProfile: CreateBusinessOwnerProfileDto & {
      userId: Identifier;
      role: string;
      email: string;
    },
  ): Promise<BusinessProfile> {
    const role = businessProfile.role;
    if (role !== UserTypes.business_owner)
      throw BadRequestException.RESOURCE_NOT_FOUND(
        'User is not a business owner',
      );
    const profile = await this.businessProfileRepository.findOne({
      userId: new Types.ObjectId(businessProfile.userId),
    });
    if (profile) {
      throw BadRequestException.RESOURCE_ALREADY_EXISTS(
        'Profile already exists for this user',
      );
    }

    const newProfile = await this.businessProfileRepository.create({
      ...businessProfile,
      user_id: new Types.ObjectId(businessProfile.userId),
    });

    return newProfile;
  }

  async updateBusinessProfile(
    businessProfile: CreateBusinessOwnerProfileDto & { userId: Identifier },
  ) {
    const profile = await this.businessProfileRepository.findOne({
      userId: new Types.ObjectId(businessProfile.userId),
    });
    if (!profile)
      throw BadRequestException.RESOURCE_NOT_FOUND(
        'Profile not found for this user',
      );

    return await this.businessProfileRepository.update(
      { userId: businessProfile.userId },
      businessProfile,
    );
  }

  async getBusinessProfile(userId: Identifier) {
    const profile = await this.businessProfileRepository.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!profile)
      throw BadRequestException.RESOURCE_NOT_FOUND(
        'Profile not found for this user',
      );

    return profile;
  }

  async uploadLogo(file: Express.Multer.File, userId: Identifier) {
    const profile = await this.businessProfileRepository.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!profile)
      throw BadRequestException.RESOURCE_NOT_FOUND(
        'Profile not found for this business owner',
      );

    const logoCloudPath = `business/${userId}`;

    const { secure_url } = await this.uploadService.uploadImage(
      file,
      logoCloudPath,
      'logos',
    );

    await this.businessProfileRepository.update(
      { userId: new Types.ObjectId(userId) },
      { logoUrl: secure_url },
    );
    return { sucess: true, url: secure_url };
  }
}
