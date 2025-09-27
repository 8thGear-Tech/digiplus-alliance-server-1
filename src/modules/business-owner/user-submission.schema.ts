import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import {
  ApplicationStatus,
  PaymentStatus,
  ServicesTypes,
} from 'src/shared/enums';

@Schema({ timestamps: true })
export class UserSubmission extends Document {
  @Prop({ type: Types.ObjectId, ref: 'ApplicationForm', required: true })
  formId: Types.ObjectId;

  @Prop({ type: Object, required: true })
  responses: Record<string, any>;

  @Prop({ type: String, required: true })
  service: string;

  @Prop({ type: String, enum: Object.values(ServicesTypes), required: true })
  service_type: ServicesTypes;

  // Add the service_price field
  @Prop({ type: Number }) // Assuming price is a number
  payment_amount?: number;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({
    type: String,
    enum: Object.values(ApplicationStatus),
    default: ApplicationStatus.Submitted,
  })
  status: ApplicationStatus;

  @Prop({
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.NotPaid,
  })
  payment_status: PaymentStatus;

  @Prop({ type: String })
  timetable_url?: string;

  @Prop({ type: Date })
  start_date?: Date;

  @Prop({ type: Date })
  end_date?: Date;
}

export const UserSubmissionSchema =
  SchemaFactory.createForClass(UserSubmission);
