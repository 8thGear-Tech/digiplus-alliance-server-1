import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { QuestionType } from '../enums/question-type.enum';
import {
  DatabaseCollectionNames,
  ValidationRule,
} from '../../../shared/enums/db.enum';

export interface QuestionOption {
  id: string;
  text: string;
  value?: number;
}

export interface GridColumn {
  id: string;
  text: string;
}

export interface GridRow {
  id: string;
  text: string;
}

// 🆕 File upload configuration interface
export interface FileUploadConfig {
  allowed_file_types?: string[]; // e.g., ['image/*', 'application/pdf', '.docx']
  max_file_size?: number; // in MB
  min_files?: number;
  max_files?: number;
  upload_instructions?: string;
}

export type QuestionDocument = Question & Document;

@Schema({
  timestamps: true,
  collection: DatabaseCollectionNames.QUESTION,
})
export class Question {
  @Prop({ type: Types.ObjectId, ref: 'Assessment', required: true })
  assessment_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AssessmentModule' })
  module_id?: Types.ObjectId;

  @Prop({ enum: QuestionType, required: true })
  type: QuestionType;

  @Prop({ required: true })
  question: string;

  @Prop()
  description?: string;

  @Prop()
  instruction?: string;

  @Prop({ type: [Object], default: [] })
  options: QuestionOption[];

  @Prop({ type: [Object], default: [] })
  grid_columns: GridColumn[];

  @Prop({ type: [Object], default: [] })
  grid_rows: GridRow[];

  @Prop({ default: true })
  is_required: boolean;

  @Prop({ enum: Object.values(ValidationRule), default: ValidationRule.NONE })
  auto_validation?: ValidationRule;

  @Prop({ enum: Object.values(ValidationRule) })
  manual_validation?: ValidationRule;

  @Prop({ type: Object })
  validation_params?: {
    min_character?: number;
    max_character?: number;
    error_message?: string;
  };

  @Prop({ required: true })
  step: number;

  @Prop({ default: 0 })
  required_score: number;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: 0 })
  max_points: number;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;

  // 🆕 File upload specific fields
  @Prop({ type: [String], default: [] })
  allowed_file_types: string[]; // ['image/*', 'application/pdf', '.docx', etc.]

  @Prop({ type: Number, default: 10 }) // Default 10MB
  max_file_size: number; // in MB

  @Prop({ type: Number, default: 1 })
  min_files: number;

  @Prop({ type: Number, default: 1 })
  max_files: number;

  @Prop({ type: String })
  upload_instructions: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
