import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminMetrics, UserService, UserWithProfile } from './user.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from './user.schema';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ApplicationStatus, UserTypes } from 'src/shared/enums';
import { JwtUserAuthGuard } from '../auth/guards/jwt-user-auth.guard';
import { GetUsersQueryDto } from './dto/user.dto';

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
}
