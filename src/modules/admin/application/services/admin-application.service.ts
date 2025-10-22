import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ApplicationForm,
  EmbeddedModule,
  EmbeddedQuestion,
} from '../schemas/application-form.schema';
import { GetApplicationsDto } from '../dtos/get-applications.dto';
import {
  CreateApplicationFormDto,
  UpdateApplicationFormDto,
} from '../dtos/create-application-form.dto';
import { QuestionValidationService } from './question-validation.service';
import { QuestionDataKeyService } from './question-data-key.service';
import {
  ApplicationStatus,
  PaymentStatus,
  ValidationRule,
  Repositories,
} from 'src/shared/enums';
import { UserSubmission } from 'src/modules/business-owner/user-submission.schema';
import { Service } from '../../services/schemas/service.schema';
import { UploadService } from 'src/modules/cloudinary/cloudinary.service';
import { UpdateTrainingDetailsDto } from '../dtos/update-training-details.dto';
import { BaseRepository } from 'src/modules/repository/base.repository';
import { UserAssessment } from 'src/modules/assessment/schemas/user-assessment.schema';

@Injectable()
export class AdminApplicationService {
  constructor(
    @InjectModel(ApplicationForm.name)
    private applicationFormModel: Model<ApplicationForm>,
    @InjectModel(UserSubmission.name)
    private submissionModel: Model<UserSubmission>,
    @Inject(Repositories.UserSubmissionRepository)
    private readonly userSubmissionRepository: BaseRepository<UserSubmission>,
    @Inject(Repositories.UserAssessmentRepository)
    private readonly userAssessmentRepository: BaseRepository<UserAssessment>,
    @InjectModel(Service.name)
    private serviceModel: Model<Service>,
    private questionValidationService: QuestionValidationService,
    private questionDataKeyService: QuestionDataKeyService,
    private readonly uploadService: UploadService,
  ) {}

  private processSingleQuestion(
    question: any,
    existingDataKeys: string[],
    isNewQuestion: boolean,
  ): any {
    const processedQuestion = { ...question };

    // ✅ ADD THIS VALIDATION
    if (question.type === 'checkbox') {
      const min = question.min_selections;
      const max = question.max_selections;

      if (min != null && max != null && min > max) {
        throw new BadRequestException(
          `Checkbox question "${question.question}": min_selections (${min}) cannot exceed max_selections (${max})`,
        );
      }
    }

    if (isNewQuestion || !processedQuestion.data_key) {
      processedQuestion.data_key = this.questionDataKeyService.generate(
        question.question,
        existingDataKeys,
      );

      existingDataKeys.push(processedQuestion.data_key);
    }

    if (
      isNewQuestion &&
      (question.type === 'short_text' || question.type === 'long_text') &&
      !question.manual_validation
    ) {
      const autoValidation =
        this.questionValidationService.detectValidationRule(question.question);
      processedQuestion.auto_validation = autoValidation;

      if (!question.placeholder && autoValidation !== ValidationRule.NONE) {
        processedQuestion.placeholder =
          this.questionValidationService.getSuggestedPlaceholder(
            autoValidation,
          );
      }

      if (!question.instruction && autoValidation !== ValidationRule.NONE) {
        processedQuestion.instruction =
          this.questionValidationService.getSuggestedInstruction(
            autoValidation,
          );
      }
    }

    return processedQuestion;
  }

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
      const specificService = submission.service;

      const paymentStatus = submission.payment_status || 'Not Paid';

      const name = `${firstName} ${lastName}`.trim();

      return {
        _id: submission._id,
        name,
        email,
        service: specificService,
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
        // Pass true for isNewQuestion during initial creation
        return this.processSingleQuestion(question, existingDataKeys, true);
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
    return savedForm.toObject() as ApplicationForm;
  }

  async updateForm(
    id: string,
    dto: UpdateApplicationFormDto,
  ): Promise<ApplicationForm> {
    const form = await this.applicationFormModel.findById(id);
    if (!form) {
      throw new NotFoundException('Application form not found.');
    }

    // 1. Update top-level properties (welcome screens, isLive, etc.)
    Object.assign(form, dto);

    if (dto.questions) {
      const existingQuestionsMap = new Map<string, EmbeddedQuestion>();

      const currentDataKeys: string[] = form.questions
        .map((q) => q.data_key)
        .filter(Boolean) as string[];

      for (const question of form.questions) {
        if (question.data_key) {
          existingQuestionsMap.set(question.data_key, question);
        }
      }

      const updatedAndNewQuestions: EmbeddedQuestion[] = [];
      const keysEncounteredInDto = new Set<string>();

      for (const incomingQuestion of dto.questions) {
        // A question is considered existing if it has a data_key that matches a question already in the form.
        const dataKey = incomingQuestion.data_key;
        const isExisting = dataKey && existingQuestionsMap.has(dataKey);

        if (isExisting) {
          // --- UPDATE EXISTING QUESTION IN-PLACE ---
          const existingQuestion = existingQuestionsMap.get(dataKey!)!;

          const updatedQuestion = this.processSingleQuestion(
            incomingQuestion,
            currentDataKeys,
            false, // isNewQuestion = false
          );

          Object.assign(existingQuestion, updatedQuestion);

          // Add the now-updated existing question to our new list
          updatedAndNewQuestions.push(existingQuestion);
          keysEncounteredInDto.add(dataKey!);
        } else {
          const questionToSave = this.processSingleQuestion(
            incomingQuestion,
            currentDataKeys,
            true,
          );

          if (questionToSave.data_key) {
            currentDataKeys.push(questionToSave.data_key);
            keysEncounteredInDto.add(questionToSave.data_key);
          }

          updatedAndNewQuestions.push(questionToSave as EmbeddedQuestion);
        }
      }

      const questionsToKeep = form.questions.filter((q) => {
        // Keep questions that were NOT included in the incoming DTO (identified by data_key)
        return q.data_key && !keysEncounteredInDto.has(q.data_key);
      });

      // The new array is the combination of the retained old questions + the updated/new questions from the DTO
      form.questions = [...questionsToKeep, ...updatedAndNewQuestions];
    }

    // 3. Modules Update: Implement Add/Update ONLY logic, preserving any modules not included in the DTO.
    if (dto.modules) {
      const existingModulesMap = new Map<string, any>(); // Key: temp_id string
      const tempIdsEncounteredInDto = new Set<string>();

      // Map existing modules by their temp_id
      for (const module of form.modules) {
        // Use temp_id as the primary lookup key for modules
        if (module.temp_id) {
          existingModulesMap.set(module.temp_id, module);
        }
      }

      const updatedAndNewModules: EmbeddedModule[] = [];

      for (const incomingModule of dto.modules) {
        const tempId = incomingModule.temp_id;

        // A module is considered existing if its temp_id matches a module already in the form.
        const isExisting = tempId && existingModulesMap.has(tempId);

        if (isExisting) {
          // --- UPDATE EXISTING MODULE IN-PLACE ---
          const existingModule = existingModulesMap.get(tempId)!;
          // Apply updates from the DTO to the existing Mongoose subdocument
          Object.assign(existingModule, incomingModule);
          updatedAndNewModules.push(existingModule);
          tempIdsEncounteredInDto.add(tempId);
        } else {
          // --- CREATE/INSERT NEW MODULE ---
          updatedAndNewModules.push(incomingModule as EmbeddedModule);
        }
      }

      // Merge: keep old modules that weren't included in the DTO, and append the updated/new modules.
      const modulesToKeep = form.modules.filter((m) => {
        // Keep modules that were NOT included in the incoming DTO (identified by temp_id)
        return m.temp_id && !tempIdsEncounteredInDto.has(m.temp_id);
      });

      form.modules = [...modulesToKeep, ...updatedAndNewModules];
    }

    const updatedForm = await form.save();
    return updatedForm.toObject() as ApplicationForm;
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
    return this.applicationFormModel.find({ isDeleted: { $ne: true } }).exec();
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

  async deleteForm(id: string): Promise<{ message: string }> {
    const form = await this.applicationFormModel.findById(id).exec();

    if (!form) {
      throw new NotFoundException(
        `Application form with ID "${id}" not found.`,
      );
    }

    // Optional: Check if form is live and prevent deletion
    if (form.isLive) {
      throw new BadRequestException(
        'Cannot delete a live form. Please unpublish it first.',
      );
    }

    // Optional: Check if there are submissions for this form
    const submissionsCount = await this.submissionModel
      .countDocuments({
        form_id: id, // Assuming submissions reference the form
      })
      .exec();

    if (submissionsCount > 0) {
      throw new BadRequestException(
        `Cannot delete form. There are ${submissionsCount} submission(s) associated with this form.`,
      );
    }

    await this.applicationFormModel.findByIdAndDelete(id).exec();

    return {
      message: 'Application form deleted successfully.',
    };
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

  async getTotalApplicationsCount(): Promise<number> {
    return this.userSubmissionRepository.count({});
  }

  async getTotalAssessmentsCompletedCount(): Promise<number> {
    return this.userAssessmentRepository.count({});
  }
}
