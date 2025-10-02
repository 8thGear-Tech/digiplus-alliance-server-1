// ============================================
// UNIFIED VALIDATION SERVICE
// ============================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ApplicationForm } from '../admin/application/schemas/application-form.schema';
import { Question } from '../assessment/schemas/question.schema';
import { QuestionValidationService } from '../admin/application/services/question-validation.service';
import { ValidationRule } from 'src/shared/enums';
import { QuestionType } from '../assessment/enums/question-type.enum';
import {
  FormType,
  GetValidationRulesDto,
  ValidateInputDto,
} from './unified-validation.dto';
import { Assessment } from '../assessment/schemas/assessment.schema';

@Injectable()
export class UnifiedValidationService {
  constructor(
    @InjectModel(ApplicationForm.name)
    private applicationFormModel: Model<ApplicationForm>,
    @InjectModel(Assessment.name)
    private assessmentModel: Model<Assessment>,
    @InjectModel(Question.name)
    private questionModel: Model<Question>,
    private questionValidationService: QuestionValidationService,
  ) {}

  /**
   * Get validation rules for either application forms or assessments
   */
  async getValidationRules(dto: GetValidationRulesDto): Promise<any> {
    if (dto.formType === FormType.APPLICATION) {
      return this.getApplicationValidationRules(dto.formId);
    } else {
      return this.getAssessmentValidationRules(dto.formId);
    }
  }

  /**
   * Validate a single input for either application forms or assessments
   */
  async validateInput(dto: ValidateInputDto): Promise<any> {
    if (dto.formType === FormType.APPLICATION) {
      return this.validateApplicationInput(
        dto.formId,
        dto.questionIdentifier,
        dto.value,
      );
    } else {
      return this.validateAssessmentInput(
        dto.formId,
        dto.questionIdentifier,
        dto.value,
      );
    }
  }

  // ============================================
  // APPLICATION FORM VALIDATION (Original)
  // ============================================

  private async getApplicationValidationRules(formId: string): Promise<any> {
    const form = await this.applicationFormModel.findById(formId);
    if (!form) {
      throw new NotFoundException('Application form not found');
    }

    const validationRules = form.questions.map((question) => ({
      data_key: question.data_key || '',
      question: question.question,
      type: question.type,
      step: question.step,
      validation:
        this.questionValidationService.generateFrontendValidation(question),
    }));

    return {
      formId: String(form._id),
      formType: FormType.APPLICATION,
      formTitle: form.welcome_title,
      validationRules,
      totalQuestions: form.questions.length,
    };
  }

  private async validateApplicationInput(
    formId: string,
    dataKey: string,
    value: any,
  ): Promise<any> {
    const form = await this.applicationFormModel.findById(formId);
    if (!form) {
      throw new NotFoundException('Application form not found');
    }

    const question = form.questions.find((q) => q.data_key === dataKey);
    if (!question) {
      throw new NotFoundException(
        `Question with data_key "${dataKey}" not found`,
      );
    }

    const validationResult = this.questionValidationService.validateUserInput(
      value,
      question,
    );

    return {
      isValid: validationResult.isValid,
      errors: validationResult.errors,
      field: dataKey,
      formType: FormType.APPLICATION,
    };
  }

  // ============================================
  // ASSESSMENT VALIDATION (New)
  // ============================================

  private async getAssessmentValidationRules(
    assessmentId: string,
  ): Promise<any> {
    // Fetch assessment details
    const assessment = await this.assessmentModel.findById(assessmentId);
    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }
    // Fetch all questions for this assessment
    const questions = await this.questionModel
      .find({ assessment_id: new Types.ObjectId(assessmentId) })
      .sort({ step: 1 })
      .exec();

    if (!questions || questions.length === 0) {
      throw new NotFoundException('No questions found for this assessment');
    }

    const validationRules = questions.map((question) => {
      // Convert assessment question to validation format
      const mappedQuestion = this.mapAssessmentQuestionToValidation(question);

      return {
        question_id: question._id.toString(),
        question: question.question,
        type: question.type,
        step: question.step,
        validation:
          this.questionValidationService.generateFrontendValidation(
            mappedQuestion,
          ),
      };
    });

    return {
      formId: assessmentId,
      formType: FormType.ASSESSMENT,
      formTitle: assessment.title,
      // formTitle: 'Assessment', // You might want to fetch assessment title separately
      validationRules,
      totalQuestions: questions.length,
    };
  }

  private async validateAssessmentInput(
    assessmentId: string,
    questionId: string,
    value: any,
  ): Promise<any> {
    const question = await this.questionModel.findById(questionId).exec();

    if (!question) {
      throw new NotFoundException(`Question with ID "${questionId}" not found`);
    }

    // Verify question belongs to this assessment
    if (question.assessment_id.toString() !== assessmentId) {
      throw new NotFoundException(
        'Question does not belong to this assessment',
      );
    }

    // Map assessment question to validation format
    const mappedQuestion = this.mapAssessmentQuestionToValidation(question);

    const validationResult = this.questionValidationService.validateUserInput(
      value,
      mappedQuestion,
    );

    return {
      isValid: validationResult.isValid,
      errors: validationResult.errors,
      field: questionId,
      formType: FormType.ASSESSMENT,
    };
  }

  /**
   * Map assessment Question schema to format expected by validation service
   */
  // private mapAssessmentQuestionToValidation(question: any): any {
  //   return {
  //     _id: question._id,
  //     type: question.type,
  //     question: question.question,
  //     description: question.description,
  //     instruction: question.instruction,
  //     is_required: question.is_required,
  //     step: question.step,

  //     // Map assessment-specific fields to application format
  //     options: question.options?.map((opt: any) => ({
  //       id: opt.id,
  //       text: opt.text,
  //       value: opt.value || opt.points, // Handle both formats
  //     })),

  //     grid_rows: question.grid_rows,
  //     grid_columns: question.grid_columns?.map((col: any) => ({
  //       id: col.id,
  //       text: col.text,
  //       value: col.points || col.value,
  //     })),

  //     // Validation doesn't need these, but keep for compatibility
  //     placeholder: question.placeholder,
  //     max_length: question.max_length,
  //     min_length: question.min_length,

  //     // Set data_key for validation service (use question_id as fallback)
  //     data_key: question._id?.toString(),

  //     // Assessment questions don't have auto_validation, set to NONE
  //     auto_validation: ValidationRule.NONE,
  //     manual_validation: ValidationRule.NONE,
  //   };
  // }

  private mapAssessmentQuestionToValidation(question: any): any {
    // Base mapping
    const mapped: any = {
      _id: question._id,
      type: this.mapAssessmentTypeToApplicationType(question.type),
      question: question.question,
      description: question.description,
      instruction: question.instruction,
      is_required: question.is_required,
      step: question.step,
      data_key: question._id?.toString(),

      // Default validation (no auto-detection for assessments)
      auto_validation: ValidationRule.NONE,
      manual_validation: ValidationRule.NONE,
    };

    // Type-specific mappings with FULL validation support
    switch (question.type) {
      case 'multiple_choice':
      case QuestionType.MULTIPLE_CHOICE:
        mapped.options = question.options?.map((opt: any) => ({
          id: opt.id,
          text: opt.text,
          value: opt.value || opt.points,
        }));
        break;

      case 'checkbox':
      case QuestionType.CHECKBOX:
        mapped.options = question.options?.map((opt: any) => ({
          id: opt.id,
          text: opt.text,
          value: opt.value || opt.points,
        }));
        mapped.min_selections = question.min_selections;
        mapped.max_selections = question.max_selections;
        mapped.scoring_method = question.scoring_method || 'sum';
        break;

      case 'dropdown':
      case QuestionType.DROPDOWN:
        mapped.options = question.options?.map((opt: any) => ({
          id: opt.id,
          text: opt.text,
          value: opt.value || opt.points,
        }));
        mapped.placeholder = question.placeholder;
        break;

      case 'short_text':
      case QuestionType.SHORT_TEXT:
        mapped.placeholder = question.placeholder;
        mapped.max_length = question.max_length;
        mapped.min_length = question.min_length;
        mapped.completion_points = question.completion_points;
        // Add validation params for length constraints
        if (question.min_length || question.max_length) {
          mapped.validation_params = {
            min_length: question.min_length,
            max_length: question.max_length,
          };
        }
        break;

      case 'long_text':
      case QuestionType.LONG_TEXT:
        mapped.placeholder = question.placeholder;
        mapped.max_length = question.max_length;
        mapped.min_length = question.min_length;
        mapped.rows = question.rows;
        mapped.completion_points = question.completion_points;
        mapped.keyword_scoring = question.keyword_scoring;
        // Add validation params for length constraints
        if (question.min_length || question.max_length) {
          mapped.validation_params = {
            min_length: question.min_length,
            max_length: question.max_length,
          };
        }
        break;

      case 'multiple_choice_grid':
      case QuestionType.MULTIPLE_CHOICE_GRID:
        mapped.grid_rows = question.grid_rows?.map((row: any) => ({
          id: row.id,
          text: row.text,
          weight: row.weight,
        }));
        mapped.grid_columns = question.grid_columns?.map((col: any) => ({
          id: col.id,
          text: col.text,
          value: col.points || col.value,
        }));
        break;

      case 'welcome_screen':
      case QuestionType.WELCOME_SCREEN:
        mapped.welcome_title = question.welcome_title;
        mapped.welcome_description = question.welcome_description;
        mapped.button_text = question.button_text;
        break;

      case 'module_title':
      case QuestionType.MODULE_TITLE:
        mapped.module_title = question.module_title;
        mapped.module_description = question.module_description;
        break;
    }

    return mapped;
  }
  /**
   * Map assessment question types to application question types
   * (They use the same enum values, but this ensures compatibility)
   */
  private mapAssessmentTypeToApplicationType(assessmentType: string): string {
    const typeMap: Record<string, string> = {
      multiple_choice: 'multiple_choice',
      checkbox: 'checkbox',
      dropdown: 'dropdown',
      short_text: 'short_text',
      long_text: 'long_text',
      multiple_choice_grid: 'multiple_choice_grid',
      welcome_screen: 'welcome_screen',
      module_title: 'module_title',
      file_upload: 'file_upload',
    };

    return typeMap[assessmentType] || assessmentType;
  }
}
