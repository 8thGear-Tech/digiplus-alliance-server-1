import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.schema';
import { Repositories } from 'src/shared/enums';
import { BaseRepository } from '../repository/base.repository';
// import { UserApplicationService } from '../business-owner/user-application.service';
import { BusinessProfile } from '../profile/schemas/business.owner.schema';
import { AdminApplicationService } from '../admin/application/services/admin-application.service';
import { InjectModel } from '@nestjs/mongoose';
import { UserSubmission } from '../business-owner/user-submission.schema';
import { Model } from 'mongoose';
import { UserAssessment } from '../assessment/schemas/user-assessment.schema';
import { GetUsersQueryDto } from './dto/user.dto';
import { Types } from 'mongoose';

export interface AdminMetrics {
  totalUsers: number;
  totalApplications: number;
  totalAssessmentsCompleted: number;
}

export interface UserWithProfile extends User {
  company_website?: string;
  phone_number?: string;
  last_login?: string;
  applications_count?: number;
  assessments_count?: number;
}

@Injectable()
export class UserService {
  constructor(
    @Inject(Repositories.UserRepository)
    private readonly userRepository: BaseRepository<User>,
    @Inject(Repositories.BusinessOwnerRepository)
    private readonly businessProfileRepository: BaseRepository<BusinessProfile>,
    @InjectModel(UserSubmission.name)
    private readonly submissionModel: Model<UserSubmission>,
    @InjectModel(UserAssessment.name)
    private readonly userAssessmentModel: Model<UserAssessment>,
    private readonly adminApplicationService: AdminApplicationService,
  ) {}

  private formatDate(date: Date | undefined): string | undefined {
    if (!date) return undefined;

    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      // second: '2-digit',
      hour12: true,
    });
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll(filters: GetUsersQueryDto): Promise<UserWithProfile[]> {
    // Build user search filter with $or for searching across multiple fields
    const userFilter: any = {};

    if (filters.search) {
      userFilter.$or = [
        { first_name: { $regex: filters.search, $options: 'i' } },
        { last_name: { $regex: filters.search, $options: 'i' } },
        { business_name: { $regex: filters.search, $options: 'i' } },
      ];
    }

    // Get users based on search filter
    const users = await this.userRepository.find(userFilter);

    // Build submission filter for service/status/payment filters
    // const submissionFilter: any = {};
    // let userIdsFromSubmissions: string[] | null = null;

    // if (filters.service || filters.status || filters.payment_status) {
    //   if (filters.service) {
    //     submissionFilter.service = { $regex: filters.service, $options: 'i' };
    //   }
    //   if (filters.status) {
    //     submissionFilter.status = filters.status;
    //   }
    //   if (filters.payment_status) {
    //     submissionFilter.payment_status = filters.payment_status;
    //   }

    //   // Get distinct user IDs that match submission filters
    //   const matchingSubmissions = await this.submissionModel
    //     .find(submissionFilter)
    //     .distinct('userId');

    //   userIdsFromSubmissions = matchingSubmissions.map((id) => id.toString());
    // }

    // Filter users based on submission criteria if applicable
    let filteredUsers = users;
    // if (userIdsFromSubmissions !== null) {
    //   filteredUsers = users.filter((user) =>
    //     userIdsFromSubmissions!.includes(user._id.toString()),
    //   );
    // }

    // If no users match the criteria, return empty array
    if (filteredUsers.length === 0) {
      return [];
    }

    // Get business profiles
    const businessProfiles = await this.businessProfileRepository.find({});
    const profileMap = new Map(
      businessProfiles.map((profile) => [profile.user_id.toString(), profile]),
    );

    // Get application counts for filtered users
    const userIds = filteredUsers.map((u) => new Types.ObjectId(u._id));

    const applicationCounts = await this.submissionModel.aggregate([
      {
        $match: { userId: { $in: userIds } },
      },
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 },
        },
      },
    ]);

    const applicationCountMap = new Map(
      applicationCounts.map((item) => [item._id.toString(), item.count]),
    );

    // Get assessment counts for filtered users
    const assessmentCounts = await this.userAssessmentModel.aggregate([
      {
        $match: {
          user_id: { $in: userIds },
          is_submitted: true,
        },
      },
      {
        $group: {
          _id: '$user_id',
          count: { $sum: 1 },
        },
      },
    ]);

    const assessmentCountMap = new Map(
      assessmentCounts.map((item) => [item._id.toString(), item.count]),
    );

    // Map all data together
    return filteredUsers.map((user) => {
      const profile = profileMap.get(user._id.toString());
      const userObj = user.toObject();
      const userId = user._id.toString();

      return {
        ...userObj,
        company_website: profile?.company_website,
        phone_number: profile?.phone_number || user.phone_number,
        last_login: this.formatDate(userObj.last_login),
        applications_count: applicationCountMap.get(userId) || 0,
        assessments_count: assessmentCountMap.get(userId) || 0,
      };
    });
  }

  findOne(filterData: Partial<User>) {
    return `This action returns a #$ user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async getAdminMetrics(): Promise<AdminMetrics> {
    const totalUsers = await this.userRepository.count({});

    const totalApplications =
      await this.adminApplicationService.getTotalApplicationsCount();

    const totalAssessmentsCompleted =
      await this.adminApplicationService.getTotalAssessmentsCompletedCount();

    return {
      totalUsers,
      totalApplications,
      totalAssessmentsCompleted,
    };
  }
}
