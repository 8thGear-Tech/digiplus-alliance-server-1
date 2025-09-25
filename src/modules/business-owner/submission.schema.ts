// src/modules/user-application/schemas/submission.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApplicationStatus, PaymentStatus } from 'src/shared/enums';

@Schema({ timestamps: true })
export class Submission extends Document {
  @Prop({ type: Object, required: true })
  responses: Record<string, any>;

  @Prop({ type: String, required: true })
  serviceType: string;

  @Prop({ type: String, required: true })
  service: string;

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

export const SubmissionSchema = SchemaFactory.createForClass(Submission);
