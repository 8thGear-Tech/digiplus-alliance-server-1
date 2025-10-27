/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/notification/notification.controller.ts
import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtUserAuthGuard } from '../auth/guards/jwt-user-auth.guard';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtUserAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20)',
  })
  @ApiQuery({
    name: 'unread_only',
    required: false,
    type: Boolean,
    description: 'Show only unread notifications',
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Notifications retrieved successfully',
        data: {
          notifications: [
            {
              id: '507f1f77bcf86cd799439011',
              title: 'Assessment Completed',
              message: "You've completed Business Readiness Assessment",
              type: 'assessment_completed',
              priority: 'medium',
              is_read: false,
              read_at: null,
              metadata: {
                assessment_id: '507f1f77bcf86cd799439012',
                score: 85,
                action_url: '/assessments/507f1f77bcf86cd799439012/results',
              },
              created_at: '2025-10-15T14:30:00.000Z',
              created_date: 'October 15, 2025',
              created_time: '02:30 PM',
            },
          ],
          pagination: {
            current_page: 1,
            per_page: 20,
            total_items: 50,
            total_pages: 3,
            has_next_page: true,
            has_previous_page: false,
          },
          unread_count: 15,
        },
      },
    },
  })
  async getUserNotifications(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('unread_only') unreadOnly?: boolean,
  ): Promise<any> {
    const userId = req.user.id || req.user._id;
    return this.notificationService.getUserNotifications(
      userId,
      page ? +page : 1,
      limit ? +limit : 20,
      unreadOnly === true ||
        (typeof unreadOnly === 'string' && unreadOnly === 'true'),
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved successfully',
    schema: {
      example: {
        success: true,
        unread_count: 15,
      },
    },
  })
  async getUnreadCount(@Request() req: any): Promise<any> {
    const userId = req.user.id || req.user._id;
    const count = await this.notificationService.getUnreadCount(userId);
    return {
      success: true,
      unread_count: count,
    };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({
    name: 'id',
    description: 'Notification ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
  })
  async markAsRead(
    @Param('id') notificationId: string,
    @Request() req: any,
  ): Promise<any> {
    const userId = req.user.id || req.user._id;
    return this.notificationService.markAsRead(notificationId, userId);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
  })
  async markAllAsRead(@Request() req: any): Promise<any> {
    const userId = req.user.id || req.user._id;
    return this.notificationService.markAllAsRead(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({
    name: 'id',
    description: 'Notification ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully',
  })
  async deleteNotification(
    @Param('id') notificationId: string,
    @Request() req: any,
  ): Promise<any> {
    const userId = req.user.id || req.user._id;
    return this.notificationService.deleteNotification(notificationId, userId);
  }
}
