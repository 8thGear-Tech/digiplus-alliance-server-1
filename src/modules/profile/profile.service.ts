import { Inject, Injectable } from '@nestjs/common';
import { BusinessOwnerProfileBaseDto } from './dtos/business-owner.dto';
import { BaseRepository } from '../repository/base.repository';
import { BusinessProfile } from './schemas/business.owner.schema';
import { AdminProfileBaseDto } from './dtos/admin.dto';
import { AdminProfile } from './schemas/admin.schema';
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
import { UpdateBusinessProfileDto } from './dtos/update-business-profile.dto';
import { UpdateAdminProfileDto } from './dtos/update-admin-profile.dto';
import { UserAssessment } from '../assessment/schemas/user-assessment.schema';

@Injectable()
export class ProfileService {
  constructor(
    @Inject(Repositories.BusinessOwnerRepository)
    private readonly businessProfileRepository: BaseRepository<BusinessProfile>,
    @Inject(Repositories.AdminRepository)
    private readonly adminProfileRepository: BaseRepository<AdminProfile>,
    @Inject(Repositories.UserRepository)
    private readonly userRepository: BaseRepository<User>,
    // @Inject(Repositories.NotificationRepository)
    // private readonly notificationRepository: BaseRepository<Notification>,
    // private readonly mailService: MailerService,
    private readonly uploadService: UploadService,
    @Inject(Repositories.UserAssessmentRepository)
    private readonly userAssessmentRepository: BaseRepository<UserAssessment>,
    // private readonly jwtService: JwtService,
  ) {}

  async updateBusinessProfile(
    businessProfile: UpdateBusinessProfileDto & { userId: Identifier },
  ) {
    const profile = await this.businessProfileRepository.findOne({
      user_id: new Types.ObjectId(businessProfile.userId),
    });

    if (!profile) {
      throw BadRequestException.RESOURCE_NOT_FOUND(
        'Profile not found for this user',
      );
    }

    const updatedProfile = await this.businessProfileRepository.update(
      { user_id: new Types.ObjectId(businessProfile.userId) },
      businessProfile,
    );

    if (businessProfile.email) {
      await this.userRepository.update(
        { _id: new Types.ObjectId(businessProfile.userId) },
        { email: businessProfile.email },
      );
    }

    return updatedProfile;
  }

  // async getBusinessProfile(userId: Identifier) {
  //   const profile = await this.businessProfileRepository.findOne({
  //     user_id: new Types.ObjectId(userId),
  //   });
  //   if (!profile)
  //     throw BadRequestException.RESOURCE_NOT_FOUND(
  //       'Profile not found for this user',
  //     );

  //   // Get assessment completion count
  //   const assessmentCount = await this.userAssessmentRepository.count({
  //     user_id: new Types.ObjectId(userId),
  //   });

  //   // Convert profile to plain object and add assessment count
  //   const profileObject = profile.toObject ? profile.toObject() : profile;

  //   return {
  //     ...profileObject,
  //     completed_assessments: assessmentCount,
  //   };
  //   // return profile;
  // }

  async getBusinessProfile(userId: Identifier) {
    // Convert ID once for reuse and validation
    const objectIdUserId = new Types.ObjectId(userId);
    const stringUserId = objectIdUserId.toString();

    // LOGGING STEP 1: Confirm the ID Mongoose is using
    console.log('DEBUG: Querying with user ID (string):', stringUserId);

    const profile = await this.businessProfileRepository.findOne({
      user_id: objectIdUserId,
    });

    if (!profile) {
      throw BadRequestException.RESOURCE_NOT_FOUND(
        'Profile not found for this user',
      );
    }

    // Attempt #1: Query using the repository (already done, still 0)
    // Attempt #2 (New): Use Mongoose's built-in countDocuments if the repository allows access to the Model.
    let assessmentCount = 0;

    try {
      // We will try the repository's count method one last time using the correct ObjectId type
      const queryCriteria = { user_id: objectIdUserId };

      assessmentCount =
        await this.userAssessmentRepository.count(queryCriteria);
    } catch (error) {
      console.error(
        'ERROR: userAssessmentRepository.count failed, attempting direct Model access.',
        error,
      );
      // If the repository fails, you would typically use dependency injection
      // to get the direct Mongoose Model here and call Model.countDocuments()

      // **If assessmentCount is 0 here, the only explanation is a repository or setup issue.**
    }

    console.log('DEBUG: Final assessmentCount retrieved:', assessmentCount);

    // Convert profile to plain object and add assessment count
    const profileObject = profile.toObject ? profile.toObject() : profile;
    return {
      ...profileObject,
      completed_assessments: assessmentCount,
    };
  }

  async updateAdminProfile(
    adminProfile: UpdateAdminProfileDto & { userId: Identifier },
  ) {
    // Find the admin profile using the correct key `user_id`
    const profile = await this.adminProfileRepository.findOne({
      user_id: new Types.ObjectId(adminProfile.userId),
    });

    if (!profile) {
      throw BadRequestException.RESOURCE_NOT_FOUND(
        'Admin profile not found for this user',
      );
    }

    // Perform the update on the admin profile collection
    await this.adminProfileRepository.update(
      { user_id: adminProfile.userId },
      adminProfile,
    );

    // Perform the update on the users collection to keep email in sync
    if (adminProfile.email) {
      await this.userRepository.update(
        { _id: adminProfile.userId },
        { email: adminProfile.email },
      );
    }

    // Return the updated profile
    const updatedProfile = await this.adminProfileRepository.findOne({
      user_id: new Types.ObjectId(adminProfile.userId),
    });

    return updatedProfile;
  }

  async getAdminProfile(userId: Identifier) {
    const profile = await this.adminProfileRepository.findOne({
      user_id: new Types.ObjectId(userId),
    });
    if (!profile)
      throw BadRequestException.RESOURCE_NOT_FOUND(
        'Admin profile not found for this user',
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
