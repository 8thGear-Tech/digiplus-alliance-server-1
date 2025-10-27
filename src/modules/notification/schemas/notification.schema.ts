import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum NotificationType {
  ASSESSMENT_COMPLETED = 'assessment_completed',
  APPLICATION_SUBMITTED = 'application_submitted',
  APPLICATION_APPROVED = 'application_approved',
  APPLICATION_REJECTED = 'application_rejected',
  PAYMENT_RECEIVED = 'payment_received',
  ASSESSMENT_PUBLISHED = 'assessment_published',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({
    type: String,
    enum: Object.values(NotificationType),
    required: true,
  })
  type: NotificationType;

  @Prop({
    type: String,
    enum: Object.values(NotificationPriority),
    default: NotificationPriority.MEDIUM,
  })
  priority: NotificationPriority;

  @Prop({ default: false })
  is_read: boolean;

  @Prop({ type: Date })
  read_at: Date;

  @Prop({ type: Object })
  metadata: {
    assessment_id?: Types.ObjectId;
    application_id?: Types.ObjectId;
    submission_id?: Types.ObjectId;
    payment_id?: Types.ObjectId;
    action_url?: string;
    [key: string]: any;
  };

  @Prop({ type: Date })
  expires_at: Date;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
