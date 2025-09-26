import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from './user.schema';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserTypes } from 'src/shared/enums';
import { JwtUserAuthGuard } from '../auth/guards/jwt-user-auth.guard';

@ApiTags('Admin / Users')
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(JwtUserAuthGuard)
@Roles(UserTypes.admin)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({
    summary: 'Admin: Get details for all system users (requires ADMIN role)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all users retrieved successfully.',

    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string' },
          first_name: { type: 'string' },
          // ... other user properties
        },
      },
    },
  })
  async getAllUsers(): Promise<User[]> {
    return this.userService.findAll();
  }
}
