/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ValidationRule } from 'src/shared/enums';
import { QuestionType } from 'src/modules/assessment/enums/question-type.enum';

// Validation parameters subdocument
@Schema({ _id: false })
export class ValidationParams {
  @Prop()
  min_character?: number;

  @Prop()
  max_character?: number;

  @Prop()
  custom_pattern?: string;

  @Prop()
  error_message?: string;
}
const ValidationParamsSchema = SchemaFactory.createForClass(ValidationParams);

// Option subdocument
@Schema({ _id: false })
export class EmbeddedOption {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  text: string;

  @Prop({ required: false })
  value?: string;
}
const EmbeddedOptionSchema = SchemaFactory.createForClass(EmbeddedOption);

// Grid Row subdocument
@Schema({ _id: false })
export class EmbeddedGridRow {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  text: string;
}
const EmbeddedGridRowSchema = SchemaFactory.createForClass(EmbeddedGridRow);

// Grid Column subdocument
@Schema({ _id: false })
export class EmbeddedGridColumn {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  text: string;

  @Prop({ required: false })
  value?: number;
}
const EmbeddedGridColumnSchema =
  SchemaFactory.createForClass(EmbeddedGridColumn);

// Embedded document for Modules
@Schema({ _id: false })
export class EmbeddedModule {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  temp_id: string; // This will be used to reference questionss

  @Prop()
  order?: number; // Optional order field
}
const EmbeddedModuleSchema = SchemaFactory.createForClass(EmbeddedModule);

// Embedded document for Questions
@Schema()
// @Schema({ _id: false })
export class EmbeddedQuestion {
  @Prop({ type: Types.ObjectId })
  _id?: Types.ObjectId;

  @Prop({ required: true, enum: Object.values(QuestionType) })
  type: QuestionType;

  @Prop({ required: true })
  question: string;

  @Prop()
  description: string;

  @Prop()
  instruction: string;

  // Validation fields
  @Prop({ enum: Object.values(ValidationRule), default: ValidationRule.NONE })
  auto_validation?: ValidationRule;

  @Prop({ enum: Object.values(ValidationRule) })
  manual_validation?: ValidationRule;

  @Prop({ type: ValidationParamsSchema })
  validation_params?: ValidationParams;

  // For multiple choice, checkbox, dropdown - array of option objects
  @Prop({ type: [EmbeddedOptionSchema] })
  options?: EmbeddedOption[];

  // For checkbox - minimum and maximum selections required
  @Prop()
  min_selections?: number;

  @Prop()
  max_selections?: number;

  // *** NEW: For short_text and long_text - minimum character limit ***
  @Prop()
  min_characters?: number;

  // *** NEW: For short_text and long_text - maximum character limit ***
  @Prop()
  max_characters?: number;

  // For multiple choice grid - array of grid row objects
  @Prop({ type: [EmbeddedGridRowSchema] })
  grid_rows?: EmbeddedGridRow[];

  // For multiple choice grid - array of grid column objects
  @Prop({ type: [EmbeddedGridColumnSchema] })
  grid_columns?: EmbeddedGridColumn[];

  // For text inputs - placeholder text
  @Prop()
  placeholder?: string;

  // For file upload - accepted file types
  @Prop([String])
  accepted_file_types?: string[];

  @Prop({ default: true })
  is_required: boolean;
  //opeyemi
  // @Prop({ default: false })
  // is_required: boolean;

  @Prop({ required: true })
  step: number;

  @Prop({ required: true })
  module_ref: string;

  // Add the data_key property here
  @Prop({ type: String, required: false })
  data_key?: string;
}
const EmbeddedQuestionSchema = SchemaFactory.createForClass(EmbeddedQuestion);

@Schema({ timestamps: true })
export class ApplicationForm extends Document {
  @Prop({ required: true })
  welcome_title: string; // Required: every form needs a title

  @Prop()
  welcome_description?: string; // Optional subtitle or context

  @Prop()
  welcome_instruction?: string;

  @Prop()
  welcome_button_text?: string; // Added this field

  @Prop({ required: true, unique: true })
  slug: string; // Add a unique slug field

  @Prop({ type: [EmbeddedModuleSchema], default: [] })
  modules: EmbeddedModule[];

  @Prop({ type: [EmbeddedQuestionSchema], default: [] })
  questions: EmbeddedQuestion[];

  @Prop({ default: false })
  isLive: boolean;
}

export const ApplicationFormSchema =
  SchemaFactory.createForClass(ApplicationForm);

// Add this transformation to clean up the response
ApplicationFormSchema.set('toJSON', {
  transform: function (doc, ret) {
    // Remove empty arrays and undefined fields from questions
    if (ret.questions) {
      ret.questions = ret.questions.map((question) => {
        const cleanQuestion = { ...question };

        // For multiple_choice (radio button) - no min/max selections
        if (question.type === 'multiple_choice') {
          delete cleanQuestion.min_selections;
          delete cleanQuestion.max_selections;
        }

        // For checkbox - keep both min and max selections
        if (question.type === 'checkbox') {
          // Keep min_selections and max_selections
        }

        // For dropdown - no min/max selections
        if (question.type === 'dropdown') {
          delete cleanQuestion.min_selections;
          delete cleanQuestion.max_selections;
        }

        // Remove options for non-choice questions
        if (
          question.type !== 'multiple_choice' &&
          question.type !== 'checkbox' &&
          question.type !== 'dropdown'
        ) {
          delete cleanQuestion.options;
          delete cleanQuestion.min_selections;
          delete cleanQuestion.max_selections;
        }

        if (question.type !== 'multiple_choice_grid') {
          delete cleanQuestion.grid_rows;
          delete cleanQuestion.grid_columns;
        }

        if (question.type !== 'short_text' && question.type !== 'long_text') {
          delete cleanQuestion.placeholder;
          delete cleanQuestion.min_characters;
          delete cleanQuestion.max_characters;
        }

        if (question.type !== 'file_upload') {
          delete cleanQuestion.accepted_file_types;
        }

        // Remove empty arrays
        Object.keys(cleanQuestion).forEach((key) => {
          if (
            Array.isArray(cleanQuestion[key]) &&
            cleanQuestion[key].length === 0
          ) {
            delete cleanQuestion[key];
          }
          if (cleanQuestion[key] === undefined || cleanQuestion[key] === null) {
            delete cleanQuestion[key];
          }
        });

        return cleanQuestion;
      });
    }

    return ret;
  },
});
