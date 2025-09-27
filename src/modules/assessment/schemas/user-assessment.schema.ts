import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DatabaseCollectionNames } from '../../../shared/enums/db.enum';

export class UserAnswer {
  @Prop({ type: Types.ObjectId, ref: 'Question', required: true })
  question_id: Types.ObjectId;

  @Prop({ type: Object, required: true })
  answer: any;

  @Prop({ type: Number })
  score?: number;
}

export type UserAssessmentDocument = UserAssessment & Document;

@Schema({
  timestamps: true,
  collection: DatabaseCollectionNames.USER_ASSESSMENT,
})
export class UserAssessment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Assessment', required: true })
  assessment_id: Types.ObjectId;

  @Prop({ type: [UserAnswer], required: true })
  answers: UserAnswer[];

  @Prop({ type: Number, required: true })
  user_score: number;

  // @Prop({ type: Number, required: true })
  // total_score: number;

  @Prop({ type: Number, required: true })
  max_possible_score: number;

  @Prop({ type: Number, required: true })
  percentage_score: number;

  @Prop({ type: String })
  feedback?: string;

  // @Prop({ type: [String] })
  // recommended_services: string[];

  @Prop({
    type: [
      {
        service_id: String,
        service_name: String,
        description: String,
        min_points: Number,
        max_points: Number,
        levels: [String],
        match_reason: String,
      },
    ],
    required: false,
  })
  recommended_services: {
    service_id: string;
    service_name: string;
    description: string;
    min_points: number;
    max_points: number;
    levels: string[];
    match_reason: string;
  }[];

  @Prop({ type: Date, default: Date.now })
  completed_at: Date;
}

export const UserAssessmentSchema =
  SchemaFactory.createForClass(UserAssessment);
