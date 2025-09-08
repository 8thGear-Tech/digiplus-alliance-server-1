import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DatabaseCollectionNames } from '../../../shared/enums/db.enum';

export type AssessmentDocument = Assessment & Document;

@Schema({
  timestamps: true,
  collection: DatabaseCollectionNames.ASSESSMENT,
})
export class Assessment {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop()
  instruction?: string;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  created_by: Types.ObjectId;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
  _id: any;
}

export const AssessmentSchema = SchemaFactory.createForClass(Assessment);
