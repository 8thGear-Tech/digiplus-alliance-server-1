import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { Service } from '../../services/schemas/service.schema';
import { UploadService } from 'src/modules/cloudinary/cloudinary.service';
import { UpdateTrainingDetailsDto } from '../dtos/update-training-details.dto';
import { BaseRepository } from 'src/modules/repository/base.repository';

@Injectable()
export class AdminApplicationService {
  constructor(
    @InjectModel(ApplicationForm.name)
    private applicationFormModel: Model<ApplicationForm>,
    @InjectModel(UserSubmission.name)
    private submissionModel: Model<UserSubmission>,
    // private readonly userSubmissionRepository: BaseRepository<UserSubmission>,
    @InjectModel(Service.name)
    private serviceModel: Model<Service>,
    private questionValidationService: QuestionValidationService,
    private questionDataKeyService: QuestionDataKeyService,
    private readonly uploadService: UploadService,
  ) {}

  private transformTrainingsList(
    submissions: any[],
    servicePriceMap: any,
  ): any[] {
    return submissions.map((submission) => {
      const firstName = submission.responses['first_name'] || 'N/A';
      const lastName = submission.responses['last_name'] || '';
      const name = `${firstName} ${lastName}`.trim();
      const email = submission.responses['email'] || 'N/A';
      const paymentStatus = submission.payment_status || 'Not Paid';
      const specificService = submission.service;
      const paymentAmount = servicePriceMap[specificService] || 'N/A';
      const startDate = submission.start_date
        ? new Date(submission.start_date).toLocaleString()
        : null;
      const endDate = submission.end_date
        ? new Date(submission.end_date).toLocaleString()
        : null;

      return {
        application_id: submission._id,
        name,
        email,
        service_type: submission.service_type,
        service: specificService,
        status: submission.status,
        submission_time: new Date(submission.createdAt).toLocaleString(),
        payment_status: paymentStatus,
        payment_amount: paymentAmount,
        timetable_url: submission.timetable_url || null,
        start_date: startDate,
        end_date: endDate,
      };
    });
  }

  private transformSubmissionsForList(submissions: any[]): any[] {
    return submissions.map((submission) => {
      const firstName = submission.responses['firstname'] || 'N/A';
      const lastName = submission.responses['lastname'] || '';
      const email = submission.responses['email'] || 'N/A';

      const paymentStatus = submission.payment_status || 'Not Paid';

      const name = `${firstName} ${lastName}`.trim();

      return {
        _id: submission._id,
        name,
        email,
        service_type: submission.service_type,
        status: submission.status,
        timestamp: new Date(submission.createdAt).toLocaleString(),

        payment_status: paymentStatus,
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
    if (dto.service_type) {
      filter.service_type = new RegExp(dto.service_type.trim(), 'i');
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

  async getTrainingParticipants(trainingName?: string): Promise<any[]> {
    const filter: any = {
      status: ApplicationStatus.Approved,
      payment_status: PaymentStatus.Paid,
    };

    if (trainingName && trainingName.trim() !== '') {
      filter.service = new RegExp(trainingName.trim(), 'i');
    } else {
      filter.service_type = new RegExp('Digital Skills & Training', 'i');
    }

    const submissions = await this.submissionModel
      .find(filter)
      .select('+service_type +timetable_url +end_date')
      .exec();

    if (submissions.length === 0) {
      throw new NotFoundException(
        `No approved and paid participants found for ${trainingName || 'digital skills & training'}.`,
      );
    }

    const services = await this.serviceModel.find().exec();
    const servicePriceMap = services.reduce((map, service) => {
      map[service.name] = service.price;
      return map;
    }, {});

    return this.transformTrainingsList(submissions, servicePriceMap);
  }

  async updateTrainingDetails(
    trainingName: string,
    updateDto: UpdateTrainingDetailsDto,
    file: Express.Multer.File,
  ): Promise<any[]> {
    const updatePayload: any = {};
    let timetable_url: string | undefined;

    if (file) {
      try {
        const sanitizedName = trainingName
          .replace(/[^a-z0-9]/gi, '_')
          .toLowerCase();
        const filename = `${sanitizedName}-timetable-${Date.now()}`;
        const folder = 'training_timetables';

        const uploadResult = await this.uploadService.uploadImage(
          file,
          filename,
          folder,
        );
        timetable_url = uploadResult.secure_url;
      } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        throw new BadRequestException(
          'Failed to upload timetable file to cloud storage.',
        );
      }
    } else if (updateDto.timetable_url) {
      timetable_url = updateDto.timetable_url;
    }

    if (timetable_url) {
      updatePayload.timetable_url = timetable_url;
    }

    if (updateDto.start_date) {
      updatePayload.start_date = new Date(updateDto.start_date);
    }
    if (updateDto.end_date) {
      updatePayload.end_date = new Date(updateDto.end_date);
    }

    if (Object.keys(updatePayload).length === 0) {
      throw new BadRequestException(
        'No valid update fields (file, URL, start date, or end date) were provided.',
      );
    }

    const filter: any = {
      service: new RegExp(trainingName.trim(), 'i'),
      status: ApplicationStatus.Approved,
      payment_status: PaymentStatus.Paid,
    };

    const updateResult = await this.submissionModel
      .updateMany(filter, { $set: updatePayload })
      .exec();

    if (updateResult.matchedCount === 0) {
      throw new NotFoundException(
        `No approved and paid participants found for training "${trainingName}" to update.`,
      );
    }

    const updatedSubmissions = await this.submissionModel
      .find(filter)
      .select('+service_type +timetable_url +start_date +end_date')
      .exec();

    const services = await this.serviceModel.find().exec();
    const servicePriceMap = services.reduce((map, service) => {
      map[service.name] = service.price;
      return map;
    }, {});

    return this.transformTrainingsList(updatedSubmissions, servicePriceMap);
  }

  // async getTotalApplicationsCount(): Promise<number> {
  //   // Counts all documents in the submissions collection
  //   return this.userSubmissionRepository.count({});
  // }

  // --- NEW: Get total assessments completed count for admin dashboard ---
  // async getTotalAssessmentsCompletedCount(): Promise<number> {
  //   // Assuming 'status' is used to define 'completed' assessments.
  //   // Adjust logic if 'assessmentCompleted' is a boolean field.
  //   return this.submissionRepository.countDocuments({
  //     status: ApplicationStatus.Completed,
  //   });
  // }
}
