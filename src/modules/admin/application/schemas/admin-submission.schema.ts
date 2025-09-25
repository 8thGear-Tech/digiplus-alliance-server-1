// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document, SchemaTypes, Types } from 'mongoose';
// import { ServicesTypes } from 'src/shared/enums';

// @Schema({ timestamps: true })
// export class Submission extends Document {
//   @Prop({ required: true })
//   service: string;

//   @Prop({ required: true, enum: Object.values(ServicesTypes) })
//   serviceType: ServicesTypes;

//   @Prop({ required: true, type: Types.ObjectId, ref: 'ApplicationForm' })
//   formId: Types.ObjectId;

//   @Prop({ type: [{ questionId: Types.ObjectId, answer: SchemaTypes.Mixed }] })
//   answers: { questionId: Types.ObjectId; answer: any }[];

//   @Prop({ required: true, default: 'Submitted' })
//   status: string;
// }

// export const SubmissionSchema = SchemaFactory.createForClass(Submission);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import {
  ApplicationStatus,
  PaymentStatus,
  ServicesTypes,
} from 'src/shared/enums';

@Schema({ timestamps: true })
export class AdminSubmission extends Document {
  @Prop({ required: true })
  service: string;

  @Prop({ required: true, enum: Object.values(ServicesTypes) })
  serviceType: ServicesTypes;

  @Prop({ required: true, type: Types.ObjectId, ref: 'ApplicationForm' })
  formId: Types.ObjectId;

  // Answers now reference the embedded question's _id.
  @Prop({
    type: [{ questionId: SchemaTypes.ObjectId, answer: SchemaTypes.Mixed }],
  })
  answers: { questionId: Types.ObjectId; answer: any }[];

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

export const AdminSubmissionSchema =
  SchemaFactory.createForClass(AdminSubmission);
