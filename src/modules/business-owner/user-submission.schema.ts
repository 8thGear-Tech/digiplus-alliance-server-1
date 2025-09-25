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
  formId: Types.ObjectId; // Add this field

  @Prop({ type: Object, required: true })
  responses: Record<string, any>;

  @Prop({ type: String, required: true })
  service: string;

  // Add the serviceType field here
  @Prop({ type: String, enum: Object.values(ServicesTypes), required: true })
  serviceType: ServicesTypes;
  // Add the userId field
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
}

export const UserSubmissionSchema =
  SchemaFactory.createForClass(UserSubmission);
