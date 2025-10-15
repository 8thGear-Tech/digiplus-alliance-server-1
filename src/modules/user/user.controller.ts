import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminMetrics, UserService, UserWithProfile } from './user.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserTypes } from 'src/shared/enums';
import { JwtUserAuthGuard } from '../auth/guards/jwt-user-auth.guard';
import { GetUsersQueryDto } from './dto/user.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('Admin / Users')
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(JwtUserAuthGuard)
@Roles(UserTypes.admin)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({
    summary:
      'Admin: Get details for all system users with optional filters (requires ADMIN role)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description:
      'Search by first name, last name, or business name (partial match)',
  })
  // @ApiQuery({
  //   name: 'service',
  //   required: false,
  //   type: String,
  //   description: 'Filter by service name',
  // })
  // @ApiQuery({
  //   name: 'status',
  //   required: false,
  //   enum: ApplicationStatus,
  //   description: 'Filter by application status',
  // })
  // @ApiQuery({
  //   name: 'payment_status',
  //   required: false,
  //   type: String,
  //   description: 'Filter by payment status',
  // })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully with filters applied.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          business_name: { type: 'string' },
          phone_number: { type: 'string' },
          company_website: { type: 'string' },
          is_verified: { type: 'boolean' },
          last_login: { type: 'string', format: 'date-time' },
          applications_count: {
            type: 'number',
            description: 'Total number of applications submitted by this user',
          },
          assessments_count: {
            type: 'number',
            description: 'Total number of assessments completed by this user',
          },
        },
      },
    },
  })
  async getAllUsers(
    @Query() query: GetUsersQueryDto,
  ): Promise<UserWithProfile[]> {
    return this.userService.findAll(query);
  }

  @Get('metrics')
  @ApiOperation({
    summary:
      'Admin: Get key system metrics (Total Users, Applications, Assessments)',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard metrics retrieved successfully.',
    schema: {
      example: {
        totalUsers: 1500,
        totalApplications: 2500,
        totalAssessmentsCompleted: 980,
      },
    },
  })
  async getAdminMetrics(): Promise<AdminMetrics> {
    return this.userService.getAdminMetrics();
  }

  // Add this endpoint to user.controller.ts

  @Get('registration-stats')
  @UseGuards(RolesGuard)
  @Roles(UserTypes.admin)
  @ApiOperation({
    summary:
      'Admin: Get user registration statistics by month for a specified year',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: 'Year to get stats for (defaults to current year)',
    example: 2025,
  })
  @ApiResponse({
    status: 200,
    description: 'User registration statistics retrieved successfully.',
    schema: {
      example: {
        success: true,
        message: 'User registration stats retrieved successfully',
        data: {
          year: 2025,
          summary: {
            total_new_users: 156,
            months_with_registrations: 10,
            average_users_per_month: 16,
          },
          monthly_breakdown: [
            {
              month: 'Jan',
              month_number: 1,
              year: 2025,
              total_users: 12,
              user_details: [
                {
                  _id: '507f1f77bcf86cd799439011',
                  email: 'user@example.com',
                  name: 'John Doe',
                  business_name: 'Acme Corp',
                  created_at: '2025-01-15T10:30:00.000Z',
                  created_date: 'January 15, 2025',
                  created_time: '10:30 AM',
                },
              ],
            },
            {
              month: 'Feb',
              month_number: 2,
              year: 2025,
              total_users: 18,
              user_details: [],
            },
            // ... rest of months
          ],
          generated_at: '2025-10-15T14:30:00.000Z',
          generated_date: 'October 15, 2025',
          generated_time: '02:30:00 PM',
        },
      },
    },
  })
  async getUserRegistrationStats(@Query('year') year?: number): Promise<any> {
    return this.userService.getUserRegistrationStats(year);
  }
}
