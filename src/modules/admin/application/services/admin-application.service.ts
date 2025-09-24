import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ApplicationForm } from '../schemas/application-form.schema';
import { Submission } from '../schemas/submission.schema';
import { GetApplicationsDto } from '../dtos/get-applications.dto';
import {
  CreateApplicationFormDto,
  UpdateApplicationFormDto,
} from '../dtos/application-form.dto';
import { QuestionValidationService } from './question-validation.service';

@Injectable()
export class AdminApplicationService {
  constructor(
    @InjectModel(ApplicationForm.name)
    private applicationFormModel: Model<ApplicationForm>,
    @InjectModel(Submission.name) private submissionModel: Model<Submission>,
    private questionValidationService: QuestionValidationService, // Inject the service
  ) {}

  async createForm(dto: CreateApplicationFormDto): Promise<ApplicationForm> {
    // Process questions to add auto-validation
    const processedQuestions =
      dto.questions?.map((question) => {
        const processedQuestion = { ...question };

        // Auto-detect validation if it's a text input and no manual validation is set
        if (
          (question.type === 'short_text' || question.type === 'long_text') &&
          !question.manual_validation
        ) {
          const autoValidation =
            this.questionValidationService.detectValidationRule(
              question.question,
            );
          processedQuestion.auto_validation = autoValidation;

          // Add suggested placeholder if none provided
          if (!question.placeholder && autoValidation !== 'none') {
            processedQuestion.placeholder =
              this.questionValidationService.getSuggestedPlaceholder(
                autoValidation,
              );
          }

          // Add suggested instruction if none provided
          if (!question.instruction && autoValidation !== 'none') {
            processedQuestion.instruction =
              this.questionValidationService.getSuggestedInstruction(
                autoValidation,
              );
          }
        }

        return processedQuestion;
      }) || [];

    const processedDto = {
      ...dto,
      questions: processedQuestions,
    };

    const newForm = new this.applicationFormModel({
      ...processedDto,
      isLive: false,
    });
    const savedForm = await newForm.save();

    // Clean up the response (remove irrelevant fields)
    const cleanForm = savedForm.toObject();

    if (cleanForm.questions) {
      cleanForm.questions = cleanForm.questions.map((question) => {
        const cleanQuestion = { ...question };

        // Remove fields that don't apply to this question type
        switch (question.type) {
          case 'multiple_choice':
          case 'checkbox':
          case 'dropdown':
            delete cleanQuestion.grid_rows;
            delete cleanQuestion.grid_columns;
            delete cleanQuestion.accepted_file_types;
            if (question.type !== 'checkbox') {
              delete cleanQuestion.min_selections;
            }
            break;

          case 'multiple_choice_grid':
            delete cleanQuestion.options;
            delete cleanQuestion.min_selections;
            delete cleanQuestion.placeholder;
            delete cleanQuestion.accepted_file_types;
            delete cleanQuestion.auto_validation;
            delete cleanQuestion.manual_validation;
            delete cleanQuestion.validation_params;
            break;

          case 'short_text':
          case 'long_text':
            delete cleanQuestion.options;
            delete cleanQuestion.min_selections;
            delete cleanQuestion.grid_rows;
            delete cleanQuestion.grid_columns;
            delete cleanQuestion.accepted_file_types;
            break;

          case 'file_upload':
            delete cleanQuestion.options;
            delete cleanQuestion.min_selections;
            delete cleanQuestion.grid_rows;
            delete cleanQuestion.grid_columns;
            delete cleanQuestion.placeholder;
            delete cleanQuestion.auto_validation;
            delete cleanQuestion.manual_validation;
            delete cleanQuestion.validation_params;
            break;
        }

        return cleanQuestion;
      });
    }

    return cleanForm as ApplicationForm;
  }

  //   async updateForm(
  //     id: string,
  //     dto: UpdateApplicationFormDto,
  //   ): Promise<ApplicationForm> {
  //     // Apply the same validation processing for updates
  //     if (dto.questions) {
  //       const processedQuestions = dto.questions.map((question) => {
  //         const processedQuestion = { ...question };

  //         if (
  //           (question.type === 'short_text' || question.type === 'long_text') &&
  //           !question.manual_validation
  //         ) {
  //           const autoValidation =
  //             this.questionValidationService.detectValidationRule(
  //               question.question,
  //             );
  //           processedQuestion.auto_validation = autoValidation;

  //           if (!question.placeholder && autoValidation !== 'none') {
  //             processedQuestion.placeholder =
  //               this.questionValidationService.getSuggestedPlaceholder(
  //                 autoValidation,
  //               );
  //           }

  //           if (!question.instruction && autoValidation !== 'none') {
  //             processedQuestion.instruction =
  //               this.questionValidationService.getSuggestedInstruction(
  //                 autoValidation,
  //               );
  //           }
  //         }

  //         return processedQuestion;
  //       });

  //       dto.questions = processedQuestions;
  //     }

  //     const updatedForm = await this.applicationFormModel.findByIdAndUpdate(
  //       id,
  //       dto,
  //       { new: true },
  //     );

  //     if (!updatedForm) {
  //       throw new NotFoundException('Application form not found.');
  //     }

  //     return updatedForm;
  //   }

  async updateForm(
    id: string,
    dto: UpdateApplicationFormDto,
  ): Promise<ApplicationForm> {
    // 1. Find the existing form
    const form = await this.applicationFormModel.findById(id);
    if (!form) {
      throw new NotFoundException('Application form not found.');
    }

    // 2. Process and update top-level fields
    if (dto.welcome_title !== undefined) form.welcome_title = dto.welcome_title;
    if (dto.welcome_description !== undefined)
      form.welcome_description = dto.welcome_description;
    if (dto.welcome_instruction !== undefined)
      form.welcome_instruction = dto.welcome_instruction;
    if (dto.welcome_button_text !== undefined)
      form.welcome_button_text = dto.welcome_button_text;
    if (dto.isLive !== undefined) form.isLive = dto.isLive;

    // 3. Process modules (add, update, or remove)
    if (dto.modules) {
      // Find modules to remove
      const incomingModuleIds = new Set(dto.modules.map((m) => m.temp_id));
      form.modules = form.modules.filter((existingModule) =>
        incomingModuleIds.has(existingModule.temp_id),
      );

      // Add/update modules
      dto.modules.forEach((incomingModule) => {
        const existingModule = form.modules.find(
          (m) => m.temp_id === incomingModule.temp_id,
        );
        if (existingModule) {
          Object.assign(existingModule, incomingModule); // Update existing
        } else {
          form.modules.push(incomingModule as any); // Add new
        }
      });
    }

    // 4. Process questions (add, update, or remove)
    if (dto.questions) {
      const incomingQuestionIds = new Set(
        dto.questions.map((q) => q._id?.toString()).filter(Boolean),
      );
      // Filter out deleted questions
      form.questions = form.questions.filter((existingQuestion) =>
        incomingQuestionIds.has(existingQuestion._id?.toString()),
      );

      // Add or update questions
      dto.questions.forEach((incomingQuestion) => {
        // Apply auto-validation logic
        if (
          (incomingQuestion.type === 'short_text' ||
            incomingQuestion.type === 'long_text') &&
          !incomingQuestion.manual_validation
        ) {
          const autoValidation =
            this.questionValidationService.detectValidationRule(
              incomingQuestion.question,
            );
          incomingQuestion.auto_validation = autoValidation;
          if (!incomingQuestion.placeholder && autoValidation !== 'none') {
            incomingQuestion.placeholder =
              this.questionValidationService.getSuggestedPlaceholder(
                autoValidation,
              );
          }
          if (!incomingQuestion.instruction && autoValidation !== 'none') {
            incomingQuestion.instruction =
              this.questionValidationService.getSuggestedInstruction(
                autoValidation,
              );
          }
        }

        if (incomingQuestion._id) {
          // Update an existing question
          const existingQuestion = form.questions.find((q) =>
            q._id?.equals(incomingQuestion._id),
          );
          if (existingQuestion) {
            Object.assign(existingQuestion, incomingQuestion);
          }
        } else {
          // Add a new question
          form.questions.push(incomingQuestion as any);
        }
      });
    }

    // 5. Save the document and return it
    const updatedForm = await form.save();
    return updatedForm;
  }

  async publishForm(id: string, isLive: boolean): Promise<ApplicationForm> {
    const updatedForm = await this.applicationFormModel
      .findByIdAndUpdate(id, { $set: { isLive: isLive } }, { new: true })
      .exec();

    if (!updatedForm) {
      throw new NotFoundException('Application form not found.');
    }

    return updatedForm;
  }
  //

  async getApplicationList(dto: GetApplicationsDto): Promise<Submission[]> {
    const filter: any = {};
    if (dto.serviceType) {
      filter.serviceType = dto.serviceType;
    }
    return this.submissionModel.find(filter).exec();
  }

  async updateApplicationStatus(
    id: string,
    status: string,
  ): Promise<Submission> {
    const updated = await this.submissionModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException('Application not found.');
    }
    return updated;
  }

  // New method to get validation rules for a specific form (useful for frontend)
  async getFormValidationRules(formId: string): Promise<any> {
    const form = await this.applicationFormModel.findById(formId);
    if (!form) {
      throw new NotFoundException('Form not found');
    }

    const validationRules = form.questions.map((question) => ({
      questionId: question._id,
      step: question.step,
      validation:
        this.questionValidationService.generateFrontendValidation(question),
    }));

    return {
      formId,
      validationRules,
    };
  }
}
