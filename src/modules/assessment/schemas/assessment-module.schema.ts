import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DatabaseCollectionNames } from '../../../shared/enums/db.enum';

export type AssessmentModuleDocument = AssessmentModule & Document;

@Schema({
  timestamps: true,
  collection: DatabaseCollectionNames.ASSESSMENT_MODULE,
})
export class AssessmentModule {
  @Prop({ type: Types.ObjectId, ref: 'Assessment', required: true })
  assessment_id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  order: number;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const AssessmentModuleSchema =
  SchemaFactory.createForClass(AssessmentModule);
