import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ApplicationForm,
  EmbeddedQuestion,
} from '../schemas/application-form.schema';
import { GetApplicationsDto } from '../dtos/get-applications.dto';
import {
  CreateApplicationFormDto,
  UpdateApplicationFormDto,
} from '../dtos/create-application-form.dto';
import { QuestionValidationService } from './question-validation.service';
import { QuestionDataKeyService } from './question-data-key.service';
import { GetFormQuestionsDto } from '../dtos/get-form-questions.dto';
import { ApplicationStatus, PaymentStatus } from 'src/shared/enums';
import { UserSubmission } from 'src/modules/business-owner/user-submission.schema';

@Injectable()
export class AdminApplicationService {
  constructor(
    @InjectModel(ApplicationForm.name)
    private applicationFormModel: Model<ApplicationForm>,
    @InjectModel(UserSubmission.name)
    private submissionModel: Model<UserSubmission>,
    private questionValidationService: QuestionValidationService, // Inject the service
    private questionDataKeyService: QuestionDataKeyService,
  ) {}

  private transformSubmissionsForList(submissions: any[]): any[] {
    return submissions.map((submission) => {
      const firstName = submission.responses['firstname'] || 'N/A';
      const lastName = submission.responses['lastname'] || '';
      const email = submission.responses['email'] || 'N/A';
      const paymentStatus =
        submission.responses['payment_status'] || 'Not Paid';

      const name = `${firstName} ${lastName}`.trim();

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
    const existingDataKeys: string[] = [];

    const processedQuestions =
      dto.questions?.map((question) => {
        const processedQuestion = { ...question };

        processedQuestion.data_key = this.questionDataKeyService.generate(
          question.question,
          existingDataKeys,
        );

        existingDataKeys.push(processedQuestion.data_key);

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

    const welcomeTitle = dto.welcome_title || 'new-form';
    let newSlug = this.questionDataKeyService.generateSlug(welcomeTitle);

    let slugExists = await this.applicationFormModel.findOne({ slug: newSlug });
    let counter = 1;
    while (slugExists) {
      newSlug = `${this.questionDataKeyService.generateSlug(welcomeTitle)}-${counter}`;
      slugExists = await this.applicationFormModel.findOne({ slug: newSlug });
      counter++;
    }

    const processedDto = {
      ...dto,
      questions: processedQuestions,
      slug: newSlug,
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

    Object.assign(form, dto);

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
      filter.serviceType = new RegExp(dto.serviceType.trim(), 'i');
    }

    const submissions = await this.submissionModel
      .find(filter)

      .exec();

    if (submissions.length === 0) {
      throw new NotFoundException(
        'No submissions found for the selected service type.',
      );
    }

    return this.transformSubmissionsForList(submissions);
  }

  async updateApplicationStatus(
    id: string,
    status: ApplicationStatus,
  ): Promise<UserSubmission> {
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
  ): Promise<UserSubmission> {
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
