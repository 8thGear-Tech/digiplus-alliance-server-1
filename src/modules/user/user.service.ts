/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
    const filteredUsers = users;
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

  // Add this method to user.service.ts

  async getUserRegistrationStats(year?: number): Promise<any> {
    const currentYear = year || new Date().getFullYear();

    // Filter for users created in the specified year
    const filter: any = {
      createdAt: {
        $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
        $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`),
      },
    };

    // Aggregate users by month
    const stats = await this.userRepository.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $month: '$createdAt' },
          totalUsers: { $sum: 1 },
          userDetails: {
            $push: {
              _id: '$_id',
              email: '$email',
              first_name: '$first_name',
              last_name: '$last_name',
              business_name: '$business_name',
              created_at: '$createdAt',
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill all 12 months with default 0
    const allMonths = Array.from({ length: 12 }, (_, i) => ({
      month: new Intl.DateTimeFormat('en', { month: 'short' }).format(
        new Date(currentYear, i),
      ),
      month_number: i + 1,
      year: currentYear,
      total_users: 0,
      user_details: [],
    }));

    // Replace with actual data where it exists
    stats.forEach((s) => {
      const monthIndex = s._id - 1;

      const userDetails = s.userDetails.map((user: any) => ({
        // _id: user._id,
        email: user.email,
        name:
          `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A',
        business_name: user.business_name || 'N/A',
        created_date: new Date(user.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        created_time: new Date(user.created_at).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      }));

      allMonths[monthIndex] = {
        month: allMonths[monthIndex].month,
        month_number: monthIndex + 1,
        year: currentYear,
        total_users: s.totalUsers,
        user_details: userDetails,
      };
    });

    const totalUsers = stats.reduce((sum, s) => sum + s.totalUsers, 0);
    const monthsWithActivity = stats.length;
    const averageUsersPerMonth =
      monthsWithActivity > 0 ? Math.round(totalUsers / monthsWithActivity) : 0;

    return {
      success: true,
      message: 'User registration stats retrieved successfully',
      data: {
        year: currentYear,
        summary: {
          total_new_users: totalUsers,
          months_with_registrations: monthsWithActivity,
          average_users_per_month: averageUsersPerMonth,
        },
        monthly_breakdown: allMonths,
        generated_at: new Date().toISOString(),
        generated_date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        generated_time: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }),
      },
    };
  }

  async getUserRegistrationYearlyStats(): Promise<any> {
    const currentYear = new Date().getFullYear();
    // Define the 6-year range (current year and 5 previous years)
    const startYear = currentYear - 5;

    // Filter for users created in the last 6 years
    const filter: any = {
      createdAt: {
        $gte: new Date(`${startYear}-01-01T00:00:00.000Z`),
        $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`),
      },
    };

    // Aggregate users by year
    const stats = await this.userRepository.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $year: '$createdAt' }, // Group by year
          totalUsers: { $sum: 1 },
          // userDetails are excluded for high-level yearly stats
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill all 6 years with default 0
    const allYears = Array.from({ length: 6 }, (_, i) => ({
      year: startYear + i,
      total_users: 0,
    }));

    // Replace with actual data where it exists
    stats.forEach((s) => {
      const yearIndex = s._id - startYear;

      if (yearIndex >= 0 && yearIndex < 6) {
        allYears[yearIndex] = {
          year: s._id,
          total_users: s.totalUsers,
        };
      }
    });

    const totalUsers = stats.reduce((sum, s) => sum + s.totalUsers, 0);
    const yearsWithActivity = stats.length;
    const averageUsersPerYear =
      yearsWithActivity > 0 ? Math.round(totalUsers / yearsWithActivity) : 0;

    return {
      success: true,
      message: 'User registration yearly stats retrieved successfully',
      data: {
        start_year: startYear,
        end_year: currentYear,
        summary: {
          total_new_users: totalUsers,
          years_with_registrations: yearsWithActivity,
          average_users_per_year: averageUsersPerYear,
        },
        yearly_breakdown: allYears,
        generated_at: new Date().toISOString(),
      },
    };
  }
}
