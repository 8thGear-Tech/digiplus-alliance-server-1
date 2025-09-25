import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ApplicationForm,
  EmbeddedQuestion,
} from '../schemas/application-form.schema';
import { AdminSubmission } from '../schemas/admin-submission.schema';
import { GetApplicationsDto } from '../dtos/get-applications.dto';
import {
  CreateApplicationFormDto,
  UpdateApplicationFormDto,
} from '../dtos/create-application-form.dto';
import { QuestionValidationService } from './question-validation.service';
import { QuestionDataKeyService } from './question-data-key.service';
import { GetFormQuestionsDto } from '../dtos/get-form-questions.dto';
import { ApplicationStatus, PaymentStatus } from 'src/shared/enums';

@Injectable()
export class AdminApplicationService {
  constructor(
    @InjectModel(ApplicationForm.name)
    private applicationFormModel: Model<ApplicationForm>,
    @InjectModel(AdminSubmission.name)
    private submissionModel: Model<AdminSubmission>,
    private questionValidationService: QuestionValidationService, // Inject the service
    private questionDataKeyService: QuestionDataKeyService,
  ) {}

  private transformSubmissionsForList(submissions: any[]): any[] {
    return submissions.map((submission) => {
      // Locate the required questions by their stable data_key
      const questions = submission.formId.questions;

      const firstNameQuestion = questions.find(
        (q) => q.data_key === 'first_name',
      );
      const lastNameQuestion = questions.find(
        (q) => q.data_key === 'last_name',
      );
      const emailQuestion = questions.find((q) => q.data_key === 'email');
      const paymentStatusQuestion = questions.find(
        (q) => q.data_key === 'payment_status',
      );

      // Find the corresponding answers using the question's _id
      const findAnswer = (question) => {
        if (!question) return null;
        return submission.answers.find((ans) =>
          ans.questionId.equals(question._id),
        );
      };

      const firstNameAnswer = findAnswer(firstNameQuestion);
      const lastNameAnswer = findAnswer(lastNameQuestion);
      const emailAnswer = findAnswer(emailQuestion);
      const paymentStatusAnswer = findAnswer(paymentStatusQuestion);

      // Combine the first name and last name
      const name =
        `${firstNameAnswer?.answer || ''} ${lastNameAnswer?.answer || ''}`.trim() ||
        'N/A';
      const email = emailAnswer?.answer || 'N/A';
      const paymentStatus = paymentStatusAnswer?.answer || 'Not Paid';

      // Return the transformed object
      return {
        _id: submission._id,
        name,
        email,
        'Service/training type': submission.serviceType,
        status: submission.status,
        timestamp: new Date(submission.createdAt).toLocaleString(),
        'Payment Stat': paymentStatus,
      };
    });
  }

  async createForm(dto: CreateApplicationFormDto): Promise<ApplicationForm> {
    const processedQuestions =
      dto.questions?.map((question) => {
        const processedQuestion = { ...question };

        processedQuestion.data_key = this.questionDataKeyService.generate(
          question.question,
          question.data_key, // Use the provided key as a fallback
        );

        // The logic for auto-detecting validation is correct and should remain.
        if (
          (question.type === 'short_text' || question.type === 'long_text') &&
          !question.manual_validation
        ) {
          const autoValidation =
            this.questionValidationService.detectValidationRule(
              question.question,
            );
          processedQuestion.auto_validation = autoValidation;

          if (!question.placeholder && autoValidation !== 'none') {
            processedQuestion.placeholder =
              this.questionValidationService.getSuggestedPlaceholder(
                autoValidation,
              );
          }

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

    const cleanForm = savedForm.toObject();

    if (cleanForm.questions) {
      cleanForm.questions = cleanForm.questions.map((question) => {
        const cleanQuestion = { ...question };
        // Rest of the cleanup logic...
        return cleanQuestion;
      });
    }

    return cleanForm as ApplicationForm;
  }

  async getSingleForm(formId: string): Promise<ApplicationForm> {
    const form = await this.applicationFormModel.findById(formId).exec();

    if (!form) {
      throw new NotFoundException(
        `Application form with ID "${formId}" not found.`,
      );
    }

    return form;
  }
  async getAllForms(): Promise<ApplicationForm[]> {
    return this.applicationFormModel.find().exec();
  }

  async updateForm(
    id: string,
    dto: UpdateApplicationFormDto,
  ): Promise<ApplicationForm> {
    const form = await this.applicationFormModel.findById(id);
    if (!form) {
      throw new NotFoundException('Application form not found.');
    }

    // ... (top-level fields and modules processing remain the same)

    if (dto.questions) {
      const incomingQuestionIds = new Set(
        dto.questions.map((q) => q._id?.toString()).filter(Boolean),
      );
      form.questions = form.questions.filter((existingQuestion) =>
        incomingQuestionIds.has(existingQuestion._id?.toString()),
      );

      dto.questions.forEach((incomingQuestion) => {
        // The manual data_key generation is removed from here.
        // The DTO has already handled this via the @Transform decorator.

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
          const existingQuestion = form.questions.find((q) =>
            q._id?.equals(incomingQuestion._id),
          );
          if (existingQuestion) {
            Object.assign(existingQuestion, incomingQuestion);
          }
        } else {
          form.questions.push(incomingQuestion as any);
        }
      });
    }

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

  async getApplicationList(dto: GetApplicationsDto): Promise<any[]> {
    const filter: any = {};
    if (dto.serviceType) {
      filter.serviceType = dto.serviceType;
    }

    // 1. Fetch submissions and populate the related form
    const submissions = await this.submissionModel
      .find(filter)
      .populate({
        path: 'formId',
        select: 'questions', // We only need the questions from the form
      })
      .exec();

    if (submissions.length === 0) {
      throw new NotFoundException(
        'No submissions found for the selected service type.',
      );
    }

    // 2. Transform the data
    return this.transformSubmissionsForList(submissions);
  }

  async updateApplicationStatus(
    id: string,
    status: ApplicationStatus,
  ): Promise<AdminSubmission> {
    const updated = await this.submissionModel.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    );

    if (!updated) {
      throw new NotFoundException('Application not found.');
    }

    return updated;
  }

  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
  ): Promise<AdminSubmission> {
    const updated = await this.submissionModel.findByIdAndUpdate(
      id,
      { payment_status: paymentStatus },
      { new: true, runValidators: true },
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
