/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
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
} from 'src/shared/enums';
import { UserSubmission } from 'src/modules/business-owner/user-submission.schema';
import { Service } from '../../services/schemas/service.schema';
import { UploadService } from 'src/modules/cloudinary/cloudinary.service';
import { UpdateTrainingDetailsDto } from '../dtos/update-training-details.dto';
// import { BaseRepository } from 'src/modules/repository/base.repository';

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

  private processSingleQuestion(
    question: any,
    existingDataKeys: string[],
    isNewQuestion: boolean,
  ): any {
    const processedQuestion = { ...question };

    // 1. DATA KEY GENERATION: Only run if it's a new question or the data_key is missing
    if (isNewQuestion || !processedQuestion.data_key) {
      processedQuestion.data_key = this.questionDataKeyService.generate(
        question.question,
        existingDataKeys,
      );
      // IMPORTANT: Add the newly generated key to the list to prevent collisions in the current batch.
      existingDataKeys.push(processedQuestion.data_key);
    }

    // 2. AUTO-VALIDATION: Only run if it's a new question and is a text type
    if (
      isNewQuestion &&
      (question.type === 'short_text' || question.type === 'long_text') &&
      !question.manual_validation // Don't auto-validate if manual validation is set
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
    // If it is an existing question, we just return the payload from the DTO, keeping
    // its existing auto_validation, placeholder, etc., unless the admin explicitly updated them in the DTO.

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

  // async createForm(dto: CreateApplicationFormDto): Promise<ApplicationForm> {
  //   const existingDataKeys: string[] = [];

  //   const processedQuestions =
  //     dto.questions?.map((question) => {
  //       const processedQuestion = { ...question };

  //       processedQuestion.data_key = this.questionDataKeyService.generate(
  //         question.question,
  //         existingDataKeys,
  //       );

  //       existingDataKeys.push(processedQuestion.data_key);

  //       if (
  //         (question.type === 'short_text' || question.type === 'long_text') &&
  //         !question.manual_validation
  //       ) {
  //         const autoValidation =
  //           this.questionValidationService.detectValidationRule(
  //             question.question,
  //           );
  //         processedQuestion.auto_validation = autoValidation;

  //         if (!question.placeholder && autoValidation !== 'none') {
  //           processedQuestion.placeholder =
  //             this.questionValidationService.getSuggestedPlaceholder(
  //               autoValidation,
  //             );
  //         }

  //         if (!question.instruction && autoValidation !== 'none') {
  //           processedQuestion.instruction =
  //             this.questionValidationService.getSuggestedInstruction(
  //               autoValidation,
  //             );
  //         }
  //       }
  //       return processedQuestion;
  //     }) || [];

  //   const welcomeTitle = dto.welcome_title || 'new-form';
  //   let newSlug = this.questionDataKeyService.generateSlug(welcomeTitle);

  //   let slugExists = await this.applicationFormModel.findOne({ slug: newSlug });
  //   let counter = 1;
  //   while (slugExists) {
  //     newSlug = `${this.questionDataKeyService.generateSlug(welcomeTitle)}-${counter}`;
  //     slugExists = await this.applicationFormModel.findOne({ slug: newSlug });
  //     counter++;
  //   }

  //   const processedDto = {
  //     ...dto,
  //     questions: processedQuestions,
  //     slug: newSlug,
  //   };

  //   const newForm = new this.applicationFormModel({
  //     ...processedDto,
  //     isLive: false,
  //   });

  //   const savedForm = await newForm.save();

  //   const cleanForm = savedForm.toObject();

  //   if (cleanForm.questions) {
  //     cleanForm.questions = cleanForm.questions.map((question) => {
  //       const cleanQuestion = { ...question };
  //       return cleanQuestion;
  //     });
  //   }

  //   return cleanForm as ApplicationForm;
  // }

  // The original monolithic creation logic (now only used for initial form POST)
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

  // --- The Refactored Update Logic (Now Add/Update ONLY) ---

  // async updateForm(
  //   id: string,
  //   dto: UpdateApplicationFormDto,
  // ): Promise<ApplicationForm> {
  //   const form = await this.applicationFormModel.findById(id);
  //   if (!form) {
  //     throw new NotFoundException('Application form not found.');
  //   }

  //   // 1. Update top-level properties (welcome screens, isLive, etc.)
  //   // Mongoose handles merging the top-level properties from the DTO.
  //   Object.assign(form, dto);

  //   if (dto.questions) {
  //     // 1a. Create a map of existing questions by data_key for fast lookup
  //     const existingQuestionsMap = new Map<string, EmbeddedQuestion>();

  //     // Collect all current data keys (for collision checking on new questions)
  //     const currentDataKeys: string[] = form.questions
  //       .map((q) => q.data_key)
  //       .filter(Boolean) as string[];

  //     // Populate map for existing items, using data_key as the unique identifier
  //     for (const question of form.questions) {
  //       if (question.data_key) {
  //         existingQuestionsMap.set(question.data_key, question);
  //       }
  //     }

  //     const newQuestionsToPush: EmbeddedQuestion[] = [];

  //     for (const incomingQuestion of dto.questions) {
  //       // A question is considered existing if it has a data_key that matches a question already in the form.
  //       // We ensure incomingQuestion.data_key is present before checking the map
  //       const isExisting =
  //         incomingQuestion.data_key &&
  //         existingQuestionsMap.has(incomingQuestion.data_key);

  //       if (isExisting) {
  //         // --- UPDATE EXISTING QUESTION IN-PLACE ---
  //         // Use the non-null assertion operator (!) since we checked for its existence
  //         const existingQuestion = existingQuestionsMap.get(
  //           incomingQuestion.data_key!,
  //         )!;

  //         // Note: Since isNewQuestion will be false, processSingleQuestion won't regenerate data_key or auto-validation fields.
  //         const updatedQuestion = this.processSingleQuestion(
  //           incomingQuestion,
  //           currentDataKeys,
  //           false, // isNewQuestion = false
  //         );

  //         // Apply all updates from the DTO to the existing Mongoose subdocument
  //         Object.assign(existingQuestion, updatedQuestion); // Safe because we asserted existingQuestion is not undefined
  //       } else {
  //         // --- CREATE/INSERT NEW QUESTION ---
  //         // Since it is new (no data_key), process it to generate the data_key and auto_validation fields
  //         const questionToSave = this.processSingleQuestion(
  //           incomingQuestion,
  //           currentDataKeys,
  //           true, // isNewQuestion = true
  //         );
  //         // Push the newly created question to a temporary list to be appended later
  //         newQuestionsToPush.push(questionToSave as EmbeddedQuestion);
  //       }
  //     }

  //     // 2. APPEND NEW QUESTIONS: This preserves all existing questions (even those not sent in the DTO)
  //     // and only adds the newly created ones.
  //     form.questions.push(...newQuestionsToPush);
  //   }

  //   // 3. Modules Update: Implement Add/Update ONLY logic, preserving any modules not included in the DTO.
  //   if (dto.modules) {
  //     // Use Map<string, any> since the EmbeddedModule type definition lacks the Mongoose _id for subdocuments
  //     const existingModulesMap = new Map<string, any>();

  //     // Map existing modules by their Mongoose _id for fast lookup
  //     for (const module of form.modules) {
  //       // Check for _id explicitly and cast to any if needed to satisfy TS compiler
  //       if ((module as any)._id) {
  //         // Use .toString() for Map key consistency
  //         existingModulesMap.set((module as any)._id.toString(), module);
  //       }
  //     }

  //     const newModulesToPush: any[] = [];

  //     for (const incomingModule of dto.modules) {
  //       // Cast incomingModule to any for _id access
  //       const moduleWithId = incomingModule as any;

  //       // A module is considered existing if it has an _id that matches a module already in the form.
  //       const isExisting =
  //         moduleWithId._id &&
  //         existingModulesMap.has(moduleWithId._id.toString());

  //       if (isExisting) {
  //         // --- UPDATE EXISTING MODULE IN-PLACE ---
  //         // Use non-null assertion as we checked for its existence
  //         const existingModule = existingModulesMap.get(
  //           moduleWithId._id!.toString(),
  //         )!;

  //         // Apply updates from the DTO to the existing Mongoose subdocument
  //         Object.assign(existingModule, incomingModule);
  //       } else {
  //         // --- CREATE/INSERT NEW MODULE ---
  //         // Mongoose will automatically assign a new _id when saved
  //         newModulesToPush.push(incomingModule);
  //       }
  //     }

  //     // Append only the newly created modules, preserving all existing ones.
  //     form.modules.push(...newModulesToPush);
  //   }

  //   const updatedForm = await form.save();
  //   return updatedForm.toObject() as ApplicationForm;
  // }

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
      // 1a. Create a map of existing questions by data_key for fast lookup
      // CRITICAL NOTE: The client MUST send the data_key for existing questions to avoid duplication.
      const existingQuestionsMap = new Map<string, EmbeddedQuestion>();

      // Collect all current data keys from the form's state (for collision checking on new questions)
      const currentDataKeys: string[] = form.questions
        .map((q) => q.data_key)
        .filter(Boolean) as string[];

      // Populate map for existing items, using data_key as the unique identifier
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

          // Process the question to apply auto-validation updates if needed, but not to regenerate the data_key
          // We pass currentDataKeys, but since we set isNewQuestion=false, it won't be used for generation.
          const updatedQuestion = this.processSingleQuestion(
            incomingQuestion,
            currentDataKeys,
            false, // isNewQuestion = false
          );

          // Apply all updates from the DTO to the existing Mongoose subdocument
          Object.assign(existingQuestion, updatedQuestion);

          // Add the now-updated existing question to our new list
          updatedAndNewQuestions.push(existingQuestion);
          keysEncounteredInDto.add(dataKey!);
        } else {
          // --- CREATE/INSERT NEW QUESTION ---
          // Since it is new (no data_key or no match), process it to generate the data_key and auto_validation fields
          const questionToSave = this.processSingleQuestion(
            incomingQuestion,
            currentDataKeys, // Pass current keys for collision check
            true, // isNewQuestion = true
          );

          // IMPORTANT: Add the generated data_key to the set to prevent collision with other new questions in the same DTO batch
          if (questionToSave.data_key) {
            currentDataKeys.push(questionToSave.data_key);
            keysEncounteredInDto.add(questionToSave.data_key);
          }

          updatedAndNewQuestions.push(questionToSave as EmbeddedQuestion);
        }
      }

      // 2. RECONCILE: Replace the entire form.questions array with the new list.
      // NOTE: Unlike the old logic, this now means any existing question not sent in dto.questions is DELETED.
      // If the intent is to only add/update and not allow deletion via DTO, the original `push` logic was closer,
      // but it had issues with ordering and tracking. For a robust array update, replacing the array is usually safer
      // provided the DTO contains the full, desired list of questions.

      // If the client only wants to ADD/UPDATE and NOT DELETE, we must merge.
      // Let's stick to the spirit of "Add/Update ONLY" and merge, keeping questions not in the DTO.

      const questionsToKeep = form.questions.filter((q) => {
        // Keep questions that were NOT included in the incoming DTO (identified by data_key)
        return q.data_key && !keysEncounteredInDto.has(q.data_key);
      });

      // The new array is the combination of the retained old questions + the updated/new questions from the DTO
      form.questions = [...questionsToKeep, ...updatedAndNewQuestions];

      // To preserve ordering if the client sent the entire list, we might need a different array manipulation,
      // but assuming the client only sends new/updated items (Add/Update ONLY), this merge works.
    }

    // 3. Modules Update: Implement Add/Update ONLY logic, preserving any modules not included in the DTO.
    if (dto.modules) {
      // FIX: Map existing modules by their client-provided temp_id, as the client is using this ID for tracking.
      // This prevents duplication when the client re-sends modules without the Mongoose _id.
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
          // New modules won't have a temp_id we can rely on for conflict in the next loop,
          // but we rely on Mongoose to handle the subdocument creation.
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
    return this.applicationFormModel.find().exec();
  }

  // async updateForm(
  //   id: string,
  //   dto: UpdateApplicationFormDto,
  // ): Promise<ApplicationForm> {
  //   const form = await this.applicationFormModel.findById(id);
  //   if (!form) {
  //     throw new NotFoundException('Application form not found.');
  //   }

  //   Object.assign(form, dto);

  //   if (dto.questions) {
  //     const incomingQuestionIds = new Set(
  //       dto.questions.map((q) => q._id?.toString()).filter(Boolean),
  //     );
  //     form.questions = form.questions.filter((existingQuestion) =>
  //       incomingQuestionIds.has(existingQuestion._id?.toString()),
  //     );

  //     dto.questions.forEach((incomingQuestion) => {
  //       if (
  //         (incomingQuestion.type === 'short_text' ||
  //           incomingQuestion.type === 'long_text') &&
  //         !incomingQuestion.manual_validation
  //       ) {
  //         const autoValidation =
  //           this.questionValidationService.detectValidationRule(
  //             incomingQuestion.question,
  //           );
  //         incomingQuestion.auto_validation = autoValidation;
  //         if (!incomingQuestion.placeholder && autoValidation !== 'none') {
  //           incomingQuestion.placeholder =
  //             this.questionValidationService.getSuggestedPlaceholder(
  //               autoValidation,
  //             );
  //         }
  //         if (!incomingQuestion.instruction && autoValidation !== 'none') {
  //           incomingQuestion.instruction =
  //             this.questionValidationService.getSuggestedInstruction(
  //               autoValidation,
  //             );
  //         }
  //       }

  //       if (incomingQuestion._id) {
  //         const existingQuestion = form.questions.find((q) =>
  //           q._id?.equals(incomingQuestion._id),
  //         );
  //         if (existingQuestion) {
  //           Object.assign(existingQuestion, incomingQuestion);
  //         }
  //       } else {
  //         form.questions.push(incomingQuestion as any);
  //       }
  //     });
  //   }

  //   const updatedForm = await form.save();
  //   return updatedForm;
  // }

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
