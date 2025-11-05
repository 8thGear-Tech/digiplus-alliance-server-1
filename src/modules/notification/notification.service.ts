/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/notification/notification.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  Notification,
  NotificationType,
  NotificationPriority,
} from './schemas/notification.schema';
import { BaseRepository } from '../repository/base.repository';
import { Repositories } from 'src/shared/enums';

export interface CreateNotificationDto {
  user_id: string | Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  metadata?: any;
  action_url?: string;
  expires_in_days?: number;
  recommendedServices?: string[];
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject(Repositories.NotificationRepository)
    private readonly notificationRepository: BaseRepository<Notification>,
  ) {}

  /**
   * Create a new notification
   */
  async create(dto: CreateNotificationDto): Promise<Notification> {
    try {
      const expiresAt = dto.expires_in_days
        ? new Date(Date.now() + dto.expires_in_days * 24 * 60 * 60 * 1000)
        : undefined;

      const notification = await this.notificationRepository.create({
        user_id: new Types.ObjectId(dto.user_id),
        title: dto.title,
        message: dto.message,
        type: dto.type,
        priority: dto.priority || NotificationPriority.MEDIUM,
        metadata: dto.metadata || {},
        expires_at: expiresAt,
        is_read: false,
        is_active: true,
      });

      this.logger.log(`Notification created for user ${dto.user_id}`);
      return notification;
    } catch (error) {
      this.logger.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get all notifications for a user
   */
  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false,
  ): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      const filter: any = {
        user_id: new Types.ObjectId(userId),
        is_active: true,
      };

      if (unreadOnly) {
        filter.is_read = false;
      }

      const [notifications, total, unreadCount] = await Promise.all([
        this.notificationRepository.findAll(filter, skip, limit, {
          createdAt: -1,
        }),
        this.notificationRepository.count(filter),
        this.notificationRepository.count({
          user_id: new Types.ObjectId(userId),
          is_read: false,
          is_active: true,
        }),
      ]);

      return {
        success: true,
        message: 'Notifications retrieved successfully',
        data: {
          notifications: notifications.map((n: any) => ({
            id: n._id,
            title: n.title,
            message: n.message,
            type: n.type,
            priority: n.priority,
            is_read: n.is_read,
            read_at: n.read_at,
            metadata: n.metadata,
            created_at: n.createdAt,
            created_date: new Date(n.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            created_time: new Date(n.createdAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }),
          })),
          pagination: {
            current_page: page,
            per_page: limit,
            total_items: total,
            total_pages: Math.ceil(total / limit),
            has_next_page: page < Math.ceil(total / limit),
            has_previous_page: page > 1,
          },
          unread_count: unreadCount,
        },
      };
    } catch (error) {
      this.logger.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<any> {
    try {
      const notification = await this.notificationRepository.findOneAndUpdate(
        {
          _id: new Types.ObjectId(notificationId),
          user_id: new Types.ObjectId(userId),
        },
        {
          is_read: true,
          read_at: new Date(),
        },
      );

      if (!notification) {
        throw new Error('Notification not found');
      }

      return {
        success: true,
        message: 'Notification marked as read',
      };
    } catch (error) {
      this.logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<any> {
    try {
      await this.notificationRepository.updateMany(
        {
          user_id: new Types.ObjectId(userId),
          is_read: false,
        },
        {
          is_read: true,
          read_at: new Date(),
        },
      );

      return {
        success: true,
        message: 'All notifications marked as read',
      };
    } catch (error) {
      this.logger.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(
    notificationId: string,
    userId: string,
  ): Promise<any> {
    try {
      const notification = await this.notificationRepository.delete({
        _id: new Types.ObjectId(notificationId),
        user_id: new Types.ObjectId(userId),
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      return {
        success: true,
        message: 'Notification deleted successfully',
      };
    } catch (error) {
      this.logger.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      user_id: new Types.ObjectId(userId),
      is_read: false,
      is_active: true,
    });
  }

  /**
   * Helper: Notify user about assessment completion
   */
  async notifyAssessmentCompleted(
    userId: string,
    assessmentTitle: string,
    score: number,
    assessmentId: string,
    recommendedServices?: string[],
  ): Promise<void> {
    try {
      await this.create({
        user_id: userId,
        title: 'Assessment Completed',
        message: `You've completed "${assessmentTitle}" with a score of ${score}%`,
        recommendedServices: recommendedServices,
        type: NotificationType.ASSESSMENT_COMPLETED,
        priority: NotificationPriority.MEDIUM,
        metadata: {
          assessment_id: new Types.ObjectId(assessmentId),
          score,
          action_url: '',
        },
        expires_in_days: 30,
      });
      this.logger.log(
        `✅ Assessment completion notification sent successfully to user ${userId} with recommended services ${recommendedServices?.join(', ')}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to send assessment completion notification to user ${userId}`,
        error.stack,
      );
    }
  }

  async notifyAssessmentRetakeLimited(
    userId: string,
    assessmentTitle: string,
    nextEligibleDate: Date,
  ): Promise<void> {
    try {
      await this.create({
        user_id: userId,
        title: 'Assessment Retake Limited',
        message: `You recently completed "${assessmentTitle}". You can retake this assessment again on ${nextEligibleDate.toDateString()}.`,
        type: NotificationType.ASSESSMENT_LIMITED,
        priority: NotificationPriority.HIGH,
        metadata: {
          next_eligible_date: nextEligibleDate,
          action_url: '',
        },
        expires_in_days: 30,
      });

      this.logger.log(
        `🚫 Assessment retake notification sent to user ${userId} for "${assessmentTitle}" — next eligible: ${nextEligibleDate.toDateString()}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to send assessment retake limitation notification to user ${userId}`,
        error.stack,
      );
    }
  }

  /**
   * Helper: Notify user about application status
   */
  async notifyApplicationStatus(
    userId: string,
    applicationId: string,
    status: 'approved' | 'rejected',
    serviceName: string,
  ): Promise<void> {
    const isApproved = status === 'approved';

    await this.create({
      user_id: userId,
      title: `Application ${isApproved ? 'Approved' : 'Rejected'}`,
      message: `Your application for "${serviceName}" has been ${status}`,
      type: isApproved
        ? NotificationType.APPLICATION_APPROVED
        : NotificationType.APPLICATION_REJECTED,
      priority: NotificationPriority.HIGH,
      metadata: {
        application_id: new Types.ObjectId(applicationId),
        service_name: serviceName,
        action_url: `/applications/${applicationId}`,
      },
      expires_in_days: 60,
    });
  }

  /**
   * Helper: Notify about new published assessment
   */
  async notifyNewAssessment(
    userId: string,
    assessmentTitle: string,
    assessmentId: string,
  ): Promise<void> {
    await this.create({
      user_id: userId,
      title: 'New Assessment Available',
      message: `A new assessment "${assessmentTitle}" is now available`,
      type: NotificationType.ASSESSMENT_PUBLISHED,
      priority: NotificationPriority.MEDIUM,
      metadata: {
        assessment_id: new Types.ObjectId(assessmentId),
        action_url: `/assessments/${assessmentId}`,
      },
      expires_in_days: 14,
    });
  }
}
