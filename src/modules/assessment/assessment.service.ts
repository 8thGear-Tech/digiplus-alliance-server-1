/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types, Model } from 'mongoose';
import { Repositories, ValidationRule } from '../../shared/enums/db.enum';
import { BaseRepository } from '../repository/base.repository';
import { AssessmentDocument } from './schemas/assessment.schema';
import { AssessmentModuleDocument } from './schemas/assessment-module.schema';
import { QuestionDocument } from './schemas/question.schema';
import { MailerService } from '../mailer/mailer.service';
import {
  UserAssessment,
  UserAssessmentDocument,
} from './schemas/user-assessment.schema';
import {
  CreateAssessmentDto,
  CreateAssessmentResDto,
} from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { BadRequestException } from 'src/exceptions';
import { QuestionType } from './enums/question-type.enum';
import { ServicesService } from '../admin/services/services.service';
import { assessmentCompletionEmail } from '../mailer/mailer.constants';
import { User } from '../user/user.schema';
import { QuestionValidationService } from '../admin/application/services/question-validation.service';
import { NotificationService } from '../notification/notification.service';
import { Question } from '../assessment/schemas/question.schema';

import { max } from 'class-validator';

@Injectable()
export class AssessmentService {
  private readonly logger = new Logger(AssessmentService.name);

  constructor(
    @Inject(Repositories.AssessmentRepository)
    private readonly assessmentRepository: BaseRepository<AssessmentDocument>,
    @Inject(Repositories.AssessmentModuleRepository)
    private readonly assessmentModuleRepository: BaseRepository<AssessmentModuleDocument>,
    @Inject(Repositories.QuestionRepository)
    private readonly questionRepository: BaseRepository<QuestionDocument>,
    @Inject(Repositories.UserAssessmentRepository)
    private readonly userAssessmentRepository: BaseRepository<UserAssessmentDocument>,
    @Inject(Repositories.ServiceRecommendationRepository)
    private readonly serviceRecommendationRepository: BaseRepository<any>,
    @InjectModel(UserAssessment.name)
    private readonly userAssessmentModel: Model<UserAssessmentDocument>,
    @Inject(Repositories.UserRepository)
    private readonly userRepository: BaseRepository<User>,
    private readonly mailService: MailerService,
    //added by opeyemi
    private questionValidationService: QuestionValidationService,
    private readonly servicesService: ServicesService,
    private readonly notificationService: NotificationService,
  ) {}

  // Add these methods to your AssessmentService class

  //below: added by opeyemi

  // In AssessmentService.createAssessment, before creating questions:

  // Add this helper method to AssessmentService
  private processAssessmentQuestion(questionDto: any): any {
    const processedQuestion = { ...questionDto };

    // Auto-detect validation for text fields
    if (
      (questionDto.type === QuestionType.SHORT_TEXT ||
        questionDto.type === QuestionType.LONG_TEXT) &&
      questionDto.question
    ) {
      const autoValidation =
        this.questionValidationService.detectValidationRule(
          questionDto.question,
        );

      if (autoValidation !== ValidationRule.NONE) {
        processedQuestion.auto_validation = autoValidation;

        if (!processedQuestion.placeholder) {
          processedQuestion.placeholder =
            this.questionValidationService.getSuggestedPlaceholder(
              autoValidation,
            );
        }

        // Add suggested instruction if not provided
        if (!processedQuestion.instruction) {
          processedQuestion.instruction =
            this.questionValidationService.getSuggestedInstruction(
              autoValidation,
            );
        }
      }
    }

    return processedQuestion;
  }

  private async validateServiceRecommendations(
    serviceRecommendations: any[],
  ): Promise<void> {
    if (!serviceRecommendations || serviceRecommendations.length === 0) {
      return; // No validation needed for empty array
    }

    const validationErrors: string[] = [];
    const serviceNames = new Set<string>();
    const serviceIds = new Set<string>();

    for (const [index, serviceDto] of serviceRecommendations.entries()) {
      // Check for duplicate service names within the assessment
      if (serviceNames.has(serviceDto.service_name)) {
        validationErrors.push(
          `Duplicate service name '${serviceDto.service_name}' found at position ${index + 1}`,
        );
      } else {
        serviceNames.add(serviceDto.service_name);
      }

      // Check for duplicate service IDs within the assessment
      if (serviceDto.service_id && serviceIds.has(serviceDto.service_id)) {
        validationErrors.push(
          `Duplicate service ID '${serviceDto.service_id}' found at position ${index + 1}`,
        );
      } else if (serviceDto.service_id) {
        serviceIds.add(serviceDto.service_id);
      }

      // REQUIRED: Service must exist in the main services catalog
      try {
        const existingService = await this.servicesService.findByName(
          serviceDto.service_name,
        );
        if (!existingService) {
          validationErrors.push(
            `Service '${serviceDto.service_name}' does not exist in the services catalog. Please create the service first before adding it to recommendations.`,
          );
        } else {
          // Verify the service_id matches the existing service if provided
          if (
            serviceDto.service_id &&
            serviceDto.service_id !== existingService._id.toString()
          ) {
            this.logger.warn(
              `Service ID mismatch for '${serviceDto.service_name}': provided '${serviceDto.service_id}' but actual ID is '${existingService._id}'`,
            );
            // Auto-correct the service_id to match existing service
            serviceDto.service_id = existingService._id.toString();
          } else if (!serviceDto.service_id) {
            // Auto-assign service_id from existing service
            serviceDto.service_id = existingService._id.toString();
          }
        }
      } catch (error) {
        // Service doesn't exist - this is now an error since services must exist
        validationErrors.push(
          `Service '${serviceDto.service_name}' not found in services catalog. All recommended services must be created before being referenced in assessments.`,
        );
      }

      // Validate point ranges don't overlap (optional but recommended)
      const otherServices = serviceRecommendations.filter(
        (_, i) => i !== index,
      );
      for (const otherService of otherServices) {
        const hasOverlap = !(
          serviceDto.max_points < otherService.min_points ||
          serviceDto.min_points > otherService.max_points
        );

        if (hasOverlap) {
          validationErrors.push(
            `Service '${serviceDto.service_name}' has overlapping point range (${serviceDto.min_points}-${serviceDto.max_points}) with '${otherService.service_name}' (${otherService.min_points}-${otherService.max_points})`,
          );
        }
      }
    }

    if (validationErrors.length > 0) {
      throw BadRequestException.BAD_REQUEST(
        `Service recommendation validation failed: ${validationErrors.join('; ')}`,
      );
    }
  }
  //above: added by opeyemi

  private mapAssessmentResponse(assessment: any) {
    return {
      id: assessment._id || assessment.id,
      title: assessment.title,
      description: assessment.description,
      instruction: assessment.instruction,
      is_active: assessment.is_active,
      total_possible_points: assessment.total_possible_points,
      created_at: assessment.created_at,
      created_by: assessment.created_by,
    };
  }

  private mapModuleResponse(module: any) {
    return {
      id: module._id || module.id,
      title: module.title,
      description: module.description,
      order: module.order,
      max_points: module.max_points,
      assessment_id: module.assessment_id,
    };
  }

  private mapQuestionResponse(question: any) {
    const base: any = {
      id: question._id || question.id,
      type: question.type,
      question: question.question,
      step: question.step,
      module_id: question.module_id,
      assessment_id: question.assessment_id,
      is_required: question.is_required,
      is_active: question.is_active,
    };

    // Add optional fields only if they exist
    if (question.description) base.description = question.description;
    if (question.instruction) base.instruction = question.instruction;
    if (question.max_points > 0) base.max_points = question.max_points;

    // Type-specific fields
    if (question.welcome_title) base.welcome_title = question.welcome_title;
    if (question.welcome_description)
      base.welcome_description = question.welcome_description;
    if (question.button_text) base.button_text = question.button_text;
    if (question.module_title) base.module_title = question.module_title;
    if (question.module_description)
      base.module_description = question.module_description;
    if (question.placeholder) base.placeholder = question.placeholder;
    if (question.max_character) base.max_character = question.max_character;
    if (question.min_character) base.min_character = question.min_character;
    if (question.rows) base.rows = question.rows;
    if (question.completion_points)
      base.completion_points = question.completion_points;
    if (question.min_selections) base.min_selections = question.min_selections;
    if (question.max_selections) base.max_selections = question.max_selections;
    if (question.scoring_method) base.scoring_method = question.scoring_method;

    // Arrays - only include if they have content
    if (question.options && question.options.length > 0) {
      base.options = question.options;
    }
    if (question.grid_columns && question.grid_columns.length > 0) {
      base.grid_columns = question.grid_columns;
    }
    if (question.grid_rows && question.grid_rows.length > 0) {
      base.grid_rows = question.grid_rows;
    }
    if (question.scoring_categories && question.scoring_categories.length > 0) {
      base.scoring_categories = question.scoring_categories;
    }
    if (question.keyword_scoring && question.keyword_scoring.length > 0) {
      base.keyword_scoring = question.keyword_scoring;
    }

    return base;
  }

  private mapServiceResponse(service: any) {
    return {
      id: service._id || service.id,
      service_id: service.service_id,
      service_name: service.service_name,
      description: service.description,
      min_points: service.min_points,
      max_points: service.max_points,
      levels: service.levels || [],
      priority: service.priority,
      assessment_id: service.assessment_id,
    };
  }

  private calculateTotalPossiblePoints(questions: any[]): number {
    return questions.reduce((total, question) => {
      switch (question.type) {
        case QuestionType.MULTIPLE_CHOICE:
        case QuestionType.DROPDOWN:
          return (
            total + this.calculateMultipleChoiceMaxPoints(question.options)
          );

        case QuestionType.CHECKBOX:
          return (
            total +
            this.calculateCheckboxMaxPoints(
              question.options,
              question.scoring_method || 'sum',
              question.max_selections,
            )
          );

        case QuestionType.SHORT_TEXT:
          return total + (question.completion_points || 0);

        case QuestionType.LONG_TEXT:
          return (
            total +
            this.calculateLongTextMaxPoints(
              question.completion_points,
              question.keyword_scoring,
            )
          );

        case QuestionType.MULTIPLE_CHOICE_GRID:
          return (
            total +
            this.calculateGridMaxPoints(
              question.grid_columns,
              question.grid_rows,
            )
          );

        default:
          return total + (question.max_points || 0);
      }
    }, 0);
  }

  private calculateModulePoints(moduleRef: string, questions: any[]): number {
    return questions
      .filter((q) => q.module_ref === moduleRef)
      .reduce((total, question) => {
        switch (question.type) {
          case QuestionType.MULTIPLE_CHOICE:
          case QuestionType.DROPDOWN:
            return (
              total + this.calculateMultipleChoiceMaxPoints(question.options)
            );
          case QuestionType.CHECKBOX:
            return (
              total +
              this.calculateCheckboxMaxPoints(
                question.options,
                question.scoring_method,
                question.max_selections,
              )
            );
          case QuestionType.SHORT_TEXT:
            return total + (question.completion_points || 0);
          case QuestionType.LONG_TEXT:
            return (
              total +
              this.calculateLongTextMaxPoints(
                question.completion_points,
                question.keyword_scoring,
              )
            );
          case QuestionType.MULTIPLE_CHOICE_GRID:
            return (
              total +
              this.calculateGridMaxPoints(
                question.grid_columns,
                question.grid_rows,
              )
            );
          default:
            this.logger.log(`Module points: ${question.max_points} points`);
            return total + (question.max_points || 0);
        }
      }, 0);
  }

  private calculateMultipleChoiceMaxPoints(options: any[]): number {
    if (!options || options.length === 0) return 0;
    return Math.max(
      ...options.map((option) => option.points ?? option.value ?? 0),
    );
  }

  private calculateCheckboxMaxPoints(
    options: any[],
    scoringMethod: string = 'sum',
    maxSelections?: number,
  ): number {
    if (!options || options.length === 0) return 0;

    const optionPoints = options.map((option) => option.points || 0);
    const selectionsLimit = maxSelections || options.length;

    switch (scoringMethod) {
      case 'sum':
        return optionPoints
          .sort((a, b) => b - a)
          .slice(0, selectionsLimit)
          .reduce((sum, points) => sum + points, 0);

      case 'average':
        return (
          optionPoints.reduce((sum, points) => sum + points, 0) /
          optionPoints.length
        );

      case 'max':
        return Math.max(...optionPoints);

      default:
        return Math.max(...optionPoints);
    }
  }

  private calculateLongTextMaxPoints(
    completionPoints: number = 0,
    keywordScoring: any[] = [],
  ): number {
    const keywordPoints =
      keywordScoring?.reduce(
        (sum, keyword) => sum + (keyword.points || 0),
        0,
      ) || 0;
    return completionPoints + keywordPoints;
  }

  private calculateGridMaxPoints(gridColumns: any[], gridRows: any[]): number {
    if (
      !gridColumns ||
      gridColumns.length === 0 ||
      !gridRows ||
      gridRows.length === 0
    ) {
      return 0;
    }

    const maxColumnPoints = Math.max(
      ...gridColumns.map((col) => col.points || 0),
    );
    const totalWeightedRows = gridRows.reduce(
      (sum, row) => sum + (row.weight || 1),
      0,
    );

    return Math.round(maxColumnPoints * totalWeightedRows);
  }

  private async updateModules(
    assessmentId: string,
    modules: any[],
  ): Promise<string[]> {
    const updatedModuleIds: string[] = [];
    const moduleMapping = new Map<string, Types.ObjectId>();

    for (const moduleDto of modules) {
      if (moduleDto.id) {
        // Update existing module
        const existingModule = await this.assessmentModuleRepository.findById(
          moduleDto.id,
        );
        if (!existingModule) {
          this.logger.warn(
            `Module with ID ${moduleDto.id} not found, skipping...`,
          );
          continue;
        }

        const updateData: any = {};
        if (moduleDto.title !== undefined) updateData.title = moduleDto.title;
        if (moduleDto.description !== undefined)
          updateData.description = moduleDto.description;
        if (moduleDto.order !== undefined) updateData.order = moduleDto.order;
        if (moduleDto.max_points !== undefined)
          updateData.max_points = moduleDto.max_points;

        if (Object.keys(updateData).length > 0) {
          await this.assessmentModuleRepository.findByIdAndUpdate(
            moduleDto.id,
            updateData,
          );
          updatedModuleIds.push(moduleDto.id);
          moduleMapping.set(
            moduleDto.temp_id || moduleDto.id,
            new Types.ObjectId(moduleDto.id),
          );
          this.logger.log(`Module ${moduleDto.id} updated`);
        }
      } else if (moduleDto.temp_id) {
        // Create new module
        const moduleData = {
          assessment_id: new Types.ObjectId(assessmentId),
          title: moduleDto.title,
          description: moduleDto.description,
          order: moduleDto.order,
          max_points: moduleDto.max_points || 0,
        };

        const newModule =
          await this.assessmentModuleRepository.create(moduleData);
        moduleMapping.set(moduleDto.temp_id, newModule._id);
        updatedModuleIds.push(newModule._id.toString());
        this.logger.log(`New module created: ${newModule._id}`);
      }
    }

    return updatedModuleIds;
  }

  private async updateQuestions(
    assessmentId: string,
    questions: any[],
  ): Promise<string[]> {
    const updatedQuestionIds: string[] = [];

    for (const questionDto of questions) {
      try {
        if (questionDto.id) {
          // Update existing question
          const existingQuestion = await this.questionRepository.findById(
            questionDto.id,
          );
          if (!existingQuestion) {
            this.logger.warn(
              `Question with ID ${questionDto.id} not found, skipping...`,
            );
            continue;
          }

          const updateData = this.buildQuestionUpdateData(questionDto);
          if (Object.keys(updateData).length > 0) {
            await this.questionRepository.findByIdAndUpdate(
              questionDto.id,
              updateData,
            );
            updatedQuestionIds.push(questionDto.id);
            this.logger.log(`Question ${questionDto.id} updated`);
          }
        } else {
          // Create new question - validate required fields
          if (!questionDto.type) {
            throw BadRequestException.BAD_REQUEST(
              'Question type is required for new questions',
            );
          }
          if (questionDto.step === undefined || questionDto.step === null) {
            throw BadRequestException.BAD_REQUEST(
              'Question step is required for new questions',
            );
          }
          if (!questionDto.question || questionDto.question.trim() === '') {
            throw BadRequestException.BAD_REQUEST('Question text is required');
          }
          // Create new question
          const questionData = this.buildNewQuestionData(
            assessmentId,
            questionDto,
          );
          const newQuestion =
            await this.questionRepository.create(questionData);
          updatedQuestionIds.push(
            (newQuestion._id as Types.ObjectId).toString(),
          );
          this.logger.log(
            `New question created: ${(newQuestion._id as Types.ObjectId).toString()}`,
          );
        }
      } catch (error) {
        // Add context about which question failed
        const questionInfo = questionDto.id
          ? `question ID ${questionDto.id}`
          : `new question at step ${questionDto.step}`;
        this.logger.error(`Error processing ${questionInfo}:`, error.message);

        if (error instanceof BadRequestException) {
          throw BadRequestException.BAD_REQUEST(
            `Error with ${questionInfo}: ${error.message}`,
          );
        }
        throw error;
      }
    }

    return updatedQuestionIds;
  }

  private buildQuestionUpdateData(questionDto: any): any {
    const updateData: any = {};

    // Common properties
    if (questionDto.question !== undefined)
      updateData.question = questionDto.question;
    if (questionDto.description !== undefined)
      updateData.description = questionDto.description;
    if (questionDto.instruction !== undefined)
      updateData.instruction = questionDto.instruction;
    if (questionDto.is_required !== undefined)
      updateData.is_required = questionDto.is_required;
    if (questionDto.step !== undefined) updateData.step = questionDto.step;
    if (questionDto.is_active !== undefined)
      updateData.is_active = questionDto.is_active;
    if (questionDto.scoring_categories !== undefined)
      updateData.scoring_categories = questionDto.scoring_categories;

    // Type-specific properties
    switch (questionDto.type) {
      case QuestionType.WELCOME_SCREEN:
        if (questionDto.welcome_title !== undefined)
          updateData.welcome_title = questionDto.welcome_title;
        if (questionDto.welcome_description !== undefined)
          updateData.welcome_description = questionDto.welcome_description;
        if (questionDto.button_text !== undefined)
          updateData.button_text = questionDto.button_text;
        break;

      case QuestionType.MODULE_TITLE:
        if (questionDto.module_title !== undefined)
          updateData.module_title = questionDto.module_title;
        if (questionDto.module_description !== undefined)
          updateData.module_description = questionDto.module_description;
        break;

      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.DROPDOWN:
        if (questionDto.options !== undefined) {
          updateData.options = questionDto.options;
          updateData.max_points = this.calculateMultipleChoiceMaxPoints(
            questionDto.options,
          );
        }
        if (questionDto.placeholder !== undefined)
          updateData.placeholder = questionDto.placeholder;
        break;

      case QuestionType.CHECKBOX:
        if (questionDto.options !== undefined) {
          updateData.options = questionDto.options;
          updateData.max_points = this.calculateCheckboxMaxPoints(
            questionDto.options,
            questionDto.scoring_method,
            questionDto.max_selections,
          );
        }
        if (questionDto.min_selections !== undefined)
          updateData.min_selections = questionDto.min_selections;
        if (questionDto.max_selections !== undefined)
          updateData.max_selections = questionDto.max_selections;
        if (questionDto.scoring_method !== undefined)
          updateData.scoring_method = questionDto.scoring_method;
        break;

      case QuestionType.SHORT_TEXT:
        if (questionDto.placeholder !== undefined)
          updateData.placeholder = questionDto.placeholder;
        if (questionDto.max_character !== undefined)
          updateData.max_character = questionDto.max_character;
        if (questionDto.min_character !== undefined)
          updateData.min_character = questionDto.min_character;
        if (questionDto.completion_points !== undefined) {
          updateData.completion_points = questionDto.completion_points;
          updateData.max_points = questionDto.completion_points;
        }
        break;

      case QuestionType.LONG_TEXT:
        if (questionDto.placeholder !== undefined)
          updateData.placeholder = questionDto.placeholder;
        if (questionDto.max_character !== undefined)
          updateData.max_character = questionDto.max_character;
        if (questionDto.min_character !== undefined)
          updateData.min_character = questionDto.min_character;
        if (questionDto.rows !== undefined) updateData.rows = questionDto.rows;
        if (questionDto.completion_points !== undefined)
          updateData.completion_points = questionDto.completion_points;
        if (questionDto.keyword_scoring !== undefined)
          updateData.keyword_scoring = questionDto.keyword_scoring;
        if (
          questionDto.completion_points !== undefined ||
          questionDto.keyword_scoring !== undefined
        ) {
          updateData.max_points = this.calculateLongTextMaxPoints(
            questionDto.completion_points,
            questionDto.keyword_scoring,
          );
        }
        break;

      case QuestionType.MULTIPLE_CHOICE_GRID:
        if (questionDto.grid_columns !== undefined)
          updateData.grid_columns = questionDto.grid_columns;
        if (questionDto.grid_rows !== undefined)
          updateData.grid_rows = questionDto.grid_rows;
        if (
          questionDto.grid_columns !== undefined ||
          questionDto.grid_rows !== undefined
        ) {
          updateData.max_points = this.calculateGridMaxPoints(
            questionDto.grid_columns || [],
            questionDto.grid_rows || [],
          );
        }
        break;
    }

    return updateData;
  }

  private buildNewQuestionData(assessmentId: string, questionDto: any): any {
    // Validate required fields for new questions
    if (!questionDto.type) {
      throw BadRequestException.BAD_REQUEST(
        'Question type is required for new questions',
      );
    }
    if (questionDto.step === undefined || questionDto.step === null) {
      throw BadRequestException.BAD_REQUEST(
        'Question step is required for new questions',
      );
    }

    // Use existing logic from createAssessment but for single question
    const baseQuestionData = {
      assessment_id: new Types.ObjectId(assessmentId),
      module_id: questionDto.module_id
        ? new Types.ObjectId(questionDto.module_id)
        : undefined,
      type: questionDto.type,
      question: questionDto.question || '', // Provide default if missing
      description: questionDto.description,
      instruction: questionDto.instruction,
      is_required: questionDto.is_required ?? false,
      step: questionDto.step,
      max_points: questionDto.max_points || 0,
      scoring_categories: questionDto.scoring_categories || [],
      is_active: questionDto.is_active ?? true,
    };

    // Apply type-specific data using existing logic
    let questionData: any = { ...baseQuestionData };

    switch (questionDto.type) {
      case QuestionType.WELCOME_SCREEN:
        questionData = {
          ...baseQuestionData,
          welcome_title: questionDto.welcome_title,
          welcome_description: questionDto.welcome_description,
          button_text: questionDto.button_text,
        };
        break;

      case QuestionType.MODULE_TITLE:
        questionData = {
          ...baseQuestionData,
          module_title: questionDto.module_title,
          module_description: questionDto.module_description,
        };
        break;

      case QuestionType.MULTIPLE_CHOICE:
        questionData = {
          ...baseQuestionData,
          options: questionDto.options || [],
          max_points: this.calculateMultipleChoiceMaxPoints(
            questionDto.options,
          ),
        };
        break;

      case QuestionType.CHECKBOX:
        questionData = {
          ...baseQuestionData,
          options: questionDto.options || [],
          min_selections: questionDto.min_selections,
          max_selections: questionDto.max_selections,
          scoring_method: questionDto.scoring_method || 'sum',
          max_points: this.calculateCheckboxMaxPoints(
            questionDto.options,
            questionDto.scoring_method,
            questionDto.max_selections,
          ),
        };
        break;

      case QuestionType.DROPDOWN:
        questionData = {
          ...baseQuestionData,
          options: questionDto.options || [],
          placeholder: questionDto.placeholder,
          max_points: this.calculateMultipleChoiceMaxPoints(
            questionDto.options,
          ),
        };
        break;

      case QuestionType.SHORT_TEXT:
        questionData = {
          ...baseQuestionData,
          placeholder: questionDto.placeholder,
          max_character: questionDto.max_character,
          min_character: questionDto.min_character,
          completion_points: questionDto.completion_points || 0,
          max_points: questionDto.completion_points || 0,
        };
        break;

      case QuestionType.LONG_TEXT:
        questionData = {
          ...baseQuestionData,
          placeholder: questionDto.placeholder,
          max_character: questionDto.max_character,
          min_character: questionDto.min_character,
          rows: questionDto.rows,
          completion_points: questionDto.completion_points || 0,
          keyword_scoring: questionDto.keyword_scoring || [],
          max_points: this.calculateLongTextMaxPoints(
            questionDto.completion_points,
            questionDto.keyword_scoring,
          ),
        };
        break;

      case QuestionType.MULTIPLE_CHOICE_GRID:
        questionData = {
          ...baseQuestionData,
          grid_columns: questionDto.grid_columns || [],
          grid_rows: questionDto.grid_rows || [],
          max_points: this.calculateGridMaxPoints(
            questionDto.grid_columns,
            questionDto.grid_rows,
          ),
        };
        break;

      default:
        questionData = baseQuestionData;
        break;
    }

    return questionData;
  }

  private async updateServiceRecommendations(
    assessmentId: string,
    serviceRecommendations: any[],
  ): Promise<string[]> {
    const updatedServiceIds: string[] = [];

    for (const serviceDto of serviceRecommendations) {
      if (serviceDto.id) {
        // Update existing service recommendation
        const updateData: any = {};
        if (serviceDto.service_id !== undefined)
          updateData.service_id = serviceDto.service_id;
        if (serviceDto.service_name !== undefined)
          updateData.service_name = serviceDto.service_name;
        if (serviceDto.description !== undefined)
          updateData.description = serviceDto.description;
        if (serviceDto.min_points !== undefined)
          updateData.min_points = serviceDto.min_points;
        if (serviceDto.max_points !== undefined)
          updateData.max_points = serviceDto.max_points;
        if (serviceDto.levels !== undefined)
          updateData.levels = serviceDto.levels;

        if (Object.keys(updateData).length > 0) {
          await this.serviceRecommendationRepository.findByIdAndUpdate(
            serviceDto.id,
            updateData,
          );
          updatedServiceIds.push(serviceDto.id);
          this.logger.log(`Service recommendation ${serviceDto.id} updated`);
        }
      } else {
        // Create new service recommendation
        const serviceData = {
          assessment_id: new Types.ObjectId(assessmentId),
          service_id: serviceDto.service_id,
          service_name: serviceDto.service_name,
          description: serviceDto.description,
          min_points: serviceDto.min_points,
          max_points: serviceDto.max_points,
          levels: serviceDto.levels || [],
        };

        const newService =
          await this.serviceRecommendationRepository.create(serviceData);
        updatedServiceIds.push(newService._id.toString());
        this.logger.log(
          `New service recommendation created: ${newService._id}`,
        );
      }
    }

    return updatedServiceIds;
  }

  private async recalculateTotalPoints(assessmentId: string): Promise<void> {
    const questions = await this.questionRepository.find({
      assessment_id: new Types.ObjectId(assessmentId),
    });

    const questionArray = Array.isArray(questions)
      ? questions
      : [questions].filter(Boolean);
    const totalPoints = this.calculateTotalPossiblePoints(questionArray);

    await this.assessmentRepository.findByIdAndUpdate(assessmentId, {
      total_possible_points: totalPoints,
    });

    this.logger.log(
      `Total points recalculated for assessment ${assessmentId}: ${totalPoints}`,
    );
  }

  //below: added by opeyemi
  private determineUserLevel(userScore: number, totalPoints: number): string {
    // Implement your logic here (e.g., 0-30% is 'Beginner', 31-70% is 'Intermediate', etc.)
    const percentage = (userScore / totalPoints) * 100;
    if (percentage < 30) return 'Beginner';
    if (percentage < 70) return 'Intermediate';
    return 'Advanced';
  }
  private getUserLevel(userScore: number, totalPoints: number): string {
    if (totalPoints === 0) return 'Unknown';

    const percentage = (userScore / totalPoints) * 100;

    if (percentage >= 90) return 'Expert';
    if (percentage >= 75) return 'Advanced';
    if (percentage >= 50) return 'Intermediate';
    if (percentage >= 25) return 'Foundational';
    return 'Beginner';
  }

  async createAssessment(
    createAssessmentDto: CreateAssessmentDto,
    userId: string,
  ): Promise<CreateAssessmentResDto> {
    try {
      // === Step 0: validate service recommendations ===
      if (
        createAssessmentDto.service_recommendations &&
        Array.isArray(createAssessmentDto.service_recommendations) &&
        createAssessmentDto.service_recommendations.length > 0
      ) {
        await this.validateServiceRecommendations(
          createAssessmentDto.service_recommendations,
        );
      }

      // === Step 1: Create assessment with temporary 0 points ===
      const assessmentData = {
        title: createAssessmentDto.title,
        description: createAssessmentDto.description,
        instruction: createAssessmentDto.instruction,
        is_active: createAssessmentDto.is_active ?? true,
        is_published: false,

        ia_submitted: false,

        created_by: new Types.ObjectId(userId),
        total_possible_points: 0,
      };

      const assessment = await this.assessmentRepository.create(assessmentData);
      this.logger.log(`Assessment created with ID: ${assessment._id}`);

      // === Step 2: Create modules ===
      const moduleMapping = new Map<string, Types.ObjectId>();
      const createdModules: AssessmentModuleDocument[] = [];

      for (const moduleDto of createAssessmentDto.modules) {
        const moduleMaxPoints = this.calculateModulePoints(
          moduleDto.temp_id,
          createAssessmentDto.questions,
        );

        const moduleData = {
          assessment_id: assessment._id as Types.ObjectId,
          title: moduleDto.title,
          description: moduleDto.description,
          order: moduleDto.order,
          max_points: moduleDto.max_points || moduleMaxPoints,
        };

        const module = await this.assessmentModuleRepository.create(moduleData);
        moduleMapping.set(moduleDto.temp_id, module._id);
        createdModules.push(module);

        this.logger.log(
          `Module created: ${moduleDto.temp_id} -> ${module._id} with ${moduleData.max_points} points`,
        );
      }

      // === Step 3: Create questions ===
      const createdQuestions: QuestionDocument[] = [];

      for (const questionDto of createAssessmentDto.questions) {
        // Process the question to detect validation
        const processedQuestionDto =
          this.processAssessmentQuestion(questionDto);

        const moduleId = moduleMapping.get(questionDto.module_ref);

        if (!moduleId && questionDto.module_ref !== 'none') {
          this.logger.warn(
            `Module reference not found: ${questionDto.module_ref}`,
          );
          continue;
        }

        // Base question data
        const baseQuestionData = {
          assessment_id: assessment._id as Types.ObjectId,
          module_id: moduleId || undefined,
          type: questionDto.type,
          question: questionDto.question,
          description: questionDto.description,
          instruction: questionDto.instruction,
          is_required: questionDto.is_required ?? true,
          auto_validation:
            processedQuestionDto.auto_validation || ValidationRule.NONE,
          step: questionDto.step,
          max_points: questionDto.max_points || 0,
          scoring_categories: questionDto.scoring_categories || [],
          is_active: questionDto.is_active ?? true,
        };

        // Extend per type
        let questionData: any = { ...baseQuestionData };

        switch (questionDto.type) {
          case QuestionType.WELCOME_SCREEN:
            questionData = {
              ...baseQuestionData,
              welcome_title: questionDto.welcome_title,
              welcome_description: questionDto.welcome_description,
              welcome_instruction: questionDto.welcome_instruction,
            };
            break;

          case QuestionType.MODULE_TITLE:
            questionData = {
              ...baseQuestionData,
              module_title: questionDto.module_title,
              module_description: questionDto.module_description,
            };
            break;

          case QuestionType.MULTIPLE_CHOICE:
            questionData = {
              ...baseQuestionData,
              options: questionDto.options || [],
              max_points: this.calculateMultipleChoiceMaxPoints(
                questionDto.options,
              ),
            };
            break;

          case QuestionType.CHECKBOX:
            questionData = {
              ...baseQuestionData,
              options: questionDto.options || [],
              min_selections: questionDto.min_selections,
              max_selections: questionDto.max_selections,
              scoring_method: questionDto.scoring_method || 'sum',
              max_points: this.calculateCheckboxMaxPoints(
                questionDto.options,
                questionDto.scoring_method,
                questionDto.max_selections,
              ),
            };
            break;

          case QuestionType.DROPDOWN:
            questionData = {
              ...baseQuestionData,
              options: questionDto.options || [],
              placeholder: questionDto.placeholder,
              max_points: this.calculateMultipleChoiceMaxPoints(
                questionDto.options,
              ),
            };
            break;

          case QuestionType.SHORT_TEXT:
            questionData = {
              ...baseQuestionData,
              placeholder: questionDto.placeholder,
              max_character: questionDto.max_character,
              min_character: questionDto.min_character,
              completion_points: questionDto.completion_points || 0,
              max_points: questionDto.completion_points || 0,
            };
            break;

          case QuestionType.LONG_TEXT:
            questionData = {
              ...baseQuestionData,
              placeholder: questionDto.placeholder,
              max_character: questionDto.max_character,
              min_character: questionDto.min_character,
              rows: questionDto.rows,
              completion_points: questionDto.completion_points || 0,
              keyword_scoring: questionDto.keyword_scoring || [],
              max_points: this.calculateLongTextMaxPoints(
                questionDto.completion_points,
                questionDto.keyword_scoring,
              ),
            };
            break;

          case QuestionType.MULTIPLE_CHOICE_GRID:
            questionData = {
              ...baseQuestionData,
              grid_columns: questionDto.grid_columns || [],
              grid_rows: questionDto.grid_rows || [],
              max_points: this.calculateGridMaxPoints(
                questionDto.grid_columns,
                questionDto.grid_rows,
              ),
            };
            break;

          default:
            questionData = baseQuestionData;
            break;
        }

        const question = await this.questionRepository.create(questionData);
        createdQuestions.push(question);

        this.logger.log(
          `Question created for step ${questionDto.step} with ${questionData.max_points} max points`,
        );
      }

      // === Step 4: Recalculate total possible points ===
      const totalPossiblePoints = createdQuestions.reduce(
        (sum, q) => sum + (q.max_points || 0),
        0,
      );

      await this.assessmentRepository.update(
        { _id: assessment._id },
        { total_possible_points: totalPossiblePoints },
      );

      this.logger.log(
        `Assessment ${assessment._id} updated with ${totalPossiblePoints} total possible points`,
      );

      // === Step 5: Create service recommendations ===
      const createdServiceRecommendations: any[] = [];

      if (
        createAssessmentDto.service_recommendations &&
        createAssessmentDto.service_recommendations.length > 0
      ) {
        for (const serviceDto of createAssessmentDto.service_recommendations) {
          if (!serviceDto.levels || serviceDto.levels.length === 0) {
            throw BadRequestException.BAD_REQUEST(
              `Service ${serviceDto.service_id} must have at least one level specified`,
            );
          }

          const serviceData = {
            assessment_id: assessment._id as Types.ObjectId,
            service_id: serviceDto.service_id,
            service_name: serviceDto.service_name,
            description: serviceDto.description,
            min_points: serviceDto.min_points,
            max_points: serviceDto.max_points,
            levels: serviceDto.levels,
          };

          const serviceRecommendation =
            await this.serviceRecommendationRepository.create(serviceData);
          createdServiceRecommendations.push(serviceRecommendation);

          this.logger.log(
            `Service recommendation created: ${serviceDto.service_name} (${serviceDto.min_points}-${serviceDto.max_points} pts) for levels: ${serviceDto.levels.join(', ')}`,
          );
        }
      }

      return {
        success: true,
        message: 'Assessment created successfully',
        data: {
          assessment: this.mapAssessmentResponse({
            ...assessment.toObject(),
            total_possible_points: totalPossiblePoints,
          }),
          modules: createdModules.map(this.mapModuleResponse),
          questions: createdQuestions.map(this.mapQuestionResponse),
          service_recommendations: createdServiceRecommendations.map(
            this.mapServiceResponse,
          ),
        },
      };
    } catch (error) {
      this.logger.error('Error creating assessment:', error);

      if (error instanceof BadRequestException) {
        if (
          error.message &&
          error.message.includes('Service recommendation validation failed')
        ) {
          throw BadRequestException.BAD_REQUEST(
            `Service validation failed: ${error.message}. Please create the required services first using the Services API (/services), then reference them by exact name in your assessment service recommendations.`,
          );
        }

        if (
          error.message &&
          error.message.includes('Question type is required')
        ) {
          throw BadRequestException.BAD_REQUEST(
            `Invalid question configuration: ${error.message}. Ensure all questions have a valid type and required fields are provided.`,
          );
        }

        if (
          error.message &&
          error.message.includes('must have at least one level specified')
        ) {
          throw BadRequestException.BAD_REQUEST(
            `Service recommendation configuration error: ${error.message}. Ensure all questions have a valid type and required fields are provided.`,
          );
        }
      }

      throw BadRequestException.BAD_REQUEST(
        `Failed to create assessment: ${error.message}. Please check your request data and try again. If the issue persists, contact support.`,
      );
    }
  }

  async togglePublishAssessment(assessmentId: string, isPublished: boolean) {
    try {
      if (!Types.ObjectId.isValid(assessmentId)) {
        throw BadRequestException.BAD_REQUEST('Invalid assessment ID format');
      }

      const assessment = await this.assessmentRepository.findById(assessmentId);

      if (!assessment) {
        throw new NotFoundException('Assessment not found');
      }

      if (assessment.is_published === isPublished) {
        throw BadRequestException.BAD_REQUEST(
          `Assessment is already ${isPublished ? 'published' : 'unpublished'}`,
        );
      }

      if (isPublished) {
        // Validate before publishing
        const questions = await this.questionRepository.find({
          assessment_id: new Types.ObjectId(assessmentId),
        });

        if (!questions || questions.length === 0) {
          throw BadRequestException.RESOURCE_NOT_FOUND(
            'Cannot publish assessment without questions',
          );
        }

        // ✅ Auto-unpublish any currently published assessment
        const currentlyPublished = await this.assessmentRepository.findOne({
          is_published: true,
          _id: { $ne: new Types.ObjectId(assessmentId) },
        });

        if (currentlyPublished) {
          await this.assessmentRepository.update(
            { _id: currentlyPublished._id },
            {
              is_published: false,
              is_active: false,
              updated_at: new Date(),
            },
          );

          this.logger.log(
            `Auto-unpublished assessment "${currentlyPublished.title}" to publish "${assessment.title}"`,
          );
        }
      }

      // Update status
      const updateData: any = {
        is_published: isPublished,
        updated_at: new Date(),
      };

      if (isPublished) {
        updateData.published_at = new Date();
        updateData.is_active = true;
      } else {
        updateData.is_active = false;
      }

      await this.assessmentRepository.update(
        { _id: new Types.ObjectId(assessmentId) },
        updateData,
      );

      this.logger.log(
        `Assessment ${assessmentId} ${isPublished ? 'published' : 'unpublished'} successfully`,
      );

      return {
        success: true,
        message: `Assessment ${isPublished ? 'published' : 'unpublished'} successfully`,
        data: {
          id: assessmentId,
          title: assessment.title,
          is_published: isPublished,
          published_at: isPublished ? new Date().toISOString() : null,
        },
      };
    } catch (error) {
      this.logger.error('Error toggling publish status:', error);

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw BadRequestException.BAD_REQUEST('Failed to update publish status');
    }
  }

  // Enhanced getAssessments with statistics
  async getAssessments(userId?: string): Promise<any> {
    try {
      const filter = userId ? { created_by: new Types.ObjectId(userId) } : {};
      const assessments = await this.assessmentRepository.find(filter);

      // Add statistics for each assessment
      const assessmentsArray = Array.isArray(assessments)
        ? assessments
        : [assessments].filter(Boolean);

      const assessmentsWithStats = await Promise.all(
        assessmentsArray.map(async (assessment: any) => {
          const assessmentObj = assessment.toObject();
          const moduleFilter: any = { assessment_id: assessment._id };
          const questionFilter: any = { assessment_id: assessment._id };

          const modules =
            await this.assessmentModuleRepository.find(moduleFilter);
          const questions = await this.questionRepository.find(questionFilter);

          // Get service recommendations (when repository is available)
          const serviceRecommendations =
            await this.serviceRecommendationRepository.find({
              assessment_id: assessment._id,
            });

          return {
            ...assessmentObj,
            statistics: {
              total_questions: Array.isArray(questions) ? questions.length : 0,
              total_modules: Array.isArray(modules) ? modules.length : 0,
              total_possible_points: assessment.total_possible_points || 0,
              service_recommendations_count: serviceRecommendations.length,
            },
          };
        }),
      );

      return {
        success: true,
        message: 'Assessments retrieved successfully',
        data: assessmentsWithStats,
      };
    } catch (error) {
      this.logger.error('Error getting assessments:', error);
      throw BadRequestException.BAD_REQUEST('Failed to retrieve assessments');
    }
  }

  async getAssessmentById(assessmentId: string, userId?: string): Promise<any> {
    try {
      const assessment = await this.assessmentRepository.findById(assessmentId);
      if (!assessment) {
        // ✅ Throw directly - no 'error' variable exists here
        throw BadRequestException.RESOURCE_NOT_FOUND('Assessment not found');
      }

      // if (userId) {
      //   const lastSubmission = await this.userAssessmentRepository.findOne({
      //     user_id: new Types.ObjectId(userId),
      //     assessment_id: new Types.ObjectId(assessmentId),
      //     is_submitted: true,
      //   });

      //   if (lastSubmission) {
      //     const completedAt = new Date(lastSubmission.completed_at);
      //     const now = new Date();

      //     const nextEligibleDate = new Date(
      //       completedAt.getTime() + 14 * 24 * 60 * 60 * 1000,
      //     );

      //     if (now <= nextEligibleDate) {
      //       const daysRemaining = Math.ceil(
      //         (nextEligibleDate.getTime() - now.getTime()) /
      //           (1000 * 60 * 60 * 24),
      //       );

      //       throw BadRequestException.BAD_REQUEST(
      //         `Users can only retake the same assessment every 2 weeks. This assessment won't be available for you until after ${nextEligibleDate.toLocaleDateString(
      //           'en-US',
      //           {
      //             weekday: 'long',
      //             year: 'numeric',
      //             month: 'short',
      //             day: 'numeric',
      //           },
      //         )} (${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining).`,
      //       );
      //     }
      //   }
      // }

      const moduleFilter: any = {
        assessment_id: new Types.ObjectId(assessmentId),
      };

      const questionFilter: any = {
        assessment_id: new Types.ObjectId(assessmentId),
      };

      const modules = await this.assessmentModuleRepository.find(moduleFilter);
      const questions = await this.questionRepository.find(questionFilter);

      const serviceRecommendations =
        await this.serviceRecommendationRepository.find({
          assessment_id: new Types.ObjectId(assessmentId),
        });

      const questionArray = (questions as any) || [];
      const moduleArray = (modules as any) || [];

      const sortedQuestions = Array.isArray(questionArray)
        ? questionArray.sort((a: any, b: any) => a.step - b.step)
        : questionArray;

      return {
        success: true,
        message: 'Assessment retrieved successfully',
        data: {
          assessment,
          modules: moduleArray,
          questions: sortedQuestions,
          service_recommendations: serviceRecommendations,
        },
      };
    } catch (error) {
      this.logger.error('Error getting assessment:', error);

      // ✅ Handle already-thrown exceptions properly
      if (error instanceof BadRequestException) {
        throw error;
      }

      // ✅ Handle NestJS HttpException
      if (error?.getStatus && typeof error.getStatus === 'function') {
        throw error;
      }

      throw BadRequestException.BAD_REQUEST('Failed to retrieve assessment');
    }
  }

  // Method to calculate user score from assessment responses
  calculateUserScore(questions: any[], userResponses: any): number {
    let totalScore = 0;

    questions.forEach((question) => {
      const response = userResponses[question._id?.toString() || question.id];
      if (!response) return;

      switch (question.type) {
        case QuestionType.MULTIPLE_CHOICE:
        case QuestionType.DROPDOWN: {
          const selectedOption = question.options?.find(
            (opt: any) => opt.id === response,
          );
          if (selectedOption) {
            // Use 'points' instead of 'value' - check both for backward compatibility
            totalScore += selectedOption.points || selectedOption.value || 0;
          }
          break;
        }

        case QuestionType.CHECKBOX: {
          const selectedOptions =
            question.options?.filter(
              (opt: any) =>
                Array.isArray(response) && response.includes(opt.id),
            ) || [];

          if (question.scoring_method === 'sum') {
            totalScore += selectedOptions.reduce(
              (sum: number, opt: any) => sum + (opt.points || opt.value || 0),
              0,
            );
          } else if (question.scoring_method === 'average') {
            const avgScore =
              selectedOptions.reduce(
                (sum: number, opt: any) => sum + (opt.points || opt.value || 0),
                0,
              ) / selectedOptions.length;
            totalScore += avgScore || 0;
          } else if (question.scoring_method === 'max') {
            totalScore += Math.max(
              ...selectedOptions.map(
                (opt: any) => opt.points || opt.value || 0,
              ),
              0,
            );
          }
          break;
        }

        case QuestionType.SHORT_TEXT:
          if (response && typeof response === 'string' && response.trim()) {
            totalScore += question.completion_points || 0;
          }
          break;

        case QuestionType.LONG_TEXT:
          if (response && typeof response === 'string' && response.trim()) {
            totalScore += question.completion_points || 0;

            // Add keyword scoring
            if (
              question.keyword_scoring &&
              Array.isArray(question.keyword_scoring)
            ) {
              question.keyword_scoring.forEach((keyword: any) => {
                if (
                  response.toLowerCase().includes(keyword.keyword.toLowerCase())
                ) {
                  totalScore += keyword.points || 0;
                }
              });
            }
          }
          break;

        case QuestionType.MULTIPLE_CHOICE_GRID: {
          // Response should be an object like: { rowId: selectedColumnId, ... }
          if (
            response &&
            typeof response === 'object' &&
            !Array.isArray(response)
          ) {
            Object.entries(response).forEach(([rowId, selectedColumnId]) => {
              // Find the row definition
              const row = question.grid_rows?.find((r: any) => r.id == rowId);

              // Find the selected column definition
              const column = question.grid_columns?.find(
                (c: any) => c.id == selectedColumnId,
              );

              if (row && column) {
                const columnScore = column.points ?? column.value ?? 0;
                const weight = row.weight ?? 1;

                totalScore += columnScore * weight;
              }
            });
          }
          break;
        }
      }
    });

    return Math.round(totalScore);
  }

  // Method to get service recommendations for a user's score
  async getServiceRecommendations(assessmentId: string, userScore: number) {
    try {
      // Get recommendations based on score range
      const recommendations = await this.serviceRecommendationRepository.find(
        {
          assessment_id: new Types.ObjectId(assessmentId),
          min_points: { $lte: userScore },
          max_points: { $gte: userScore },
        },
        null,
        { sort: { min_points: 1 } },
      );

      // Load assessment safely
      const assessment = await this.assessmentRepository.findById(assessmentId);

      //added by opeyemi
      if (!assessment) {
        throw BadRequestException.BAD_REQUEST('Assessment not found');
      }

      // const plainAssessment = assessment ? assessment.toObject() : null;

      // if (!plainAssessment) {
      //   throw BadRequestException.BAD_REQUEST('Assessment not found');
      // }

      //added by opeyemi
      if (!assessment) {
        throw BadRequestException.BAD_REQUEST('Assessment not found');
      }

      // Either use stored value or recalc dynamically
      let totalPoints = (assessment as any).total_possible_points;
      if (totalPoints === undefined) {
        const questions = await this.questionRepository.find({
          assessment_id: new Types.ObjectId(assessmentId),
        });
        totalPoints = this.calculateTotalPossiblePoints(questions);
      }

      const userLevel = this.getUserLevel(userScore, totalPoints);

      // Filter recommendations by level
      const filteredRecommendations = recommendations.filter(
        (rec) => Array.isArray(rec.levels) && rec.levels.includes(userLevel),
      );

      const finalRecommendations =
        filteredRecommendations.length > 0
          ? filteredRecommendations
          : recommendations;

      this.logger.log(
        `Found ${finalRecommendations.length} service recommendations for user score ${userScore} (level: ${userLevel})`,
      );

      return {
        success: true,
        data: finalRecommendations.map((rec) => ({
          id: rec._id,
          service_id: rec.service_id,
          service_name: rec.service_name,
          description: rec.description,
          min_points: rec.min_points,
          max_points: rec.max_points,
          levels: rec.levels, // now an array
          match_reason:
            Array.isArray(rec.levels) && rec.levels.includes(userLevel)
              ? 'Level Match'
              : 'Score Range Match',
        })),
        user_score: userScore,
        user_level: userLevel,

        //added by opeyemi
        total_possible_points: totalPoints,
        assessment_title: assessment.title,
      };
    } catch (error) {
      this.logger.error('Error fetching service recommendations:', error);
      throw BadRequestException.BAD_REQUEST(
        'Failed to fetch service recommendations',
      );
    }
  }

  // Existing methods remain unchanged
  async getAvailableAssessments(): Promise<any> {
    try {
      const filter: any = {
        is_active: true,
        is_published: true,
      };

      const assessments = await this.assessmentRepository.find(filter);
      const assessmentArray = (assessments as any) || [];

      const publicAssessments = Array.isArray(assessmentArray)
        ? assessmentArray.map((assessment: any) => ({
            _id: assessment._id,
            title: assessment.title,
            description: assessment.description,
            instruction: assessment.instruction,
            total_possible_points: assessment.total_possible_points || 0,
          }))
        : [];

      return {
        success: true,
        message: 'Available assessments retrieved successfully',
        data: publicAssessments,
      };
    } catch (error) {
      this.logger.error('Error getting available assessments:', error);
      throw BadRequestException.BAD_REQUEST(
        'Failed to retrieve available assessments',
      );
    }
  }

  async getUserAssessments(
    userId: string,
    filters?: {
      startDate?: string; // ISO date string
      endDate?: string; // ISO date string
      minScore?: number;
      maxScore?: number;
    },
  ): Promise<any> {
    try {
      const filter: any = {
        user_id: new Types.ObjectId(userId),
      };

      // Date filtering
      if (filters?.startDate || filters?.endDate) {
        filter.completed_at = {};
        if (filters.startDate) {
          filter.completed_at.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          filter.completed_at.$lte = new Date(filters.endDate);
        }
      }

      // 🏆 Score filtering
      if (filters?.minScore || filters?.maxScore) {
        filter.user_score = {};
        if (filters.minScore !== undefined) {
          filter.user_score.$gte = filters.minScore;
        }
        if (filters.maxScore !== undefined) {
          filter.user_score.$lte = filters.maxScore;
        }
      }

      const assessments = await this.userAssessmentRepository.find(filter);

      return {
        success: true,
        message: 'User assessments retrieved successfully',
        data: assessments,
      };
    } catch (error) {
      this.logger.error('Error getting user assessments:', error);
      throw BadRequestException.BAD_REQUEST(
        'Failed to retrieve user assessments',
      );
    }
  }

  // Add this method to your AssessmentService class
  async updateAssessment(
    assessmentId: string,
    updateAssessmentDto: UpdateAssessmentDto,
  ): Promise<any> {
    try {
      // Validate assessment exists
      const existingAssessment =
        await this.assessmentRepository.findById(assessmentId);
      if (!existingAssessment) {
        throw BadRequestException.BAD_REQUEST('Assessment not found');
      }

      //below: added by opeyemi

      // FIXED: Explicit null/undefined check instead of optional chaining with length
      if (
        updateAssessmentDto.service_recommendations &&
        Array.isArray(updateAssessmentDto.service_recommendations) &&
        updateAssessmentDto.service_recommendations.length > 0
      ) {
        await this.validateServiceRecommendations(
          updateAssessmentDto.service_recommendations,
        );
      }

      //above: added by opeyemi
      // No authorization check needed here - RolesGuard handles it

      const updatedItems = {
        modules: [] as string[],
        questions: [] as string[],
        service_recommendations: [] as string[],
      };

      // Update assessment basic properties
      const assessmentUpdateData: any = {};
      if (updateAssessmentDto.title !== undefined) {
        assessmentUpdateData.title = updateAssessmentDto.title;
      }
      if (updateAssessmentDto.description !== undefined) {
        assessmentUpdateData.description = updateAssessmentDto.description;
      }
      if (updateAssessmentDto.instruction !== undefined) {
        assessmentUpdateData.instruction = updateAssessmentDto.instruction;
      }
      if (updateAssessmentDto.is_active !== undefined) {
        assessmentUpdateData.is_active = updateAssessmentDto.is_active;
      }

      if (Object.keys(assessmentUpdateData).length > 0) {
        await this.assessmentRepository.findByIdAndUpdate(
          assessmentId,
          assessmentUpdateData,
        );
        this.logger.log(`Assessment ${assessmentId} basic properties updated`);
      }

      // Update modules if provided
      if (
        updateAssessmentDto.modules &&
        updateAssessmentDto.modules.length > 0
      ) {
        const moduleUpdates = await this.updateModules(
          assessmentId,
          updateAssessmentDto.modules,
        );
        updatedItems.modules = moduleUpdates;
      }

      // Update questions if provided
      if (
        updateAssessmentDto.questions &&
        updateAssessmentDto.questions.length > 0
      ) {
        const questionUpdates = await this.updateQuestions(
          assessmentId,
          updateAssessmentDto.questions,
        );
        updatedItems.questions = questionUpdates;
      }

      // Update service recommendations if provided
      if (
        updateAssessmentDto.service_recommendations &&
        updateAssessmentDto.service_recommendations.length > 0
      ) {
        const serviceUpdates = await this.updateServiceRecommendations(
          assessmentId,
          updateAssessmentDto.service_recommendations,
        );
        updatedItems.service_recommendations = serviceUpdates;
      }

      // Recalculate total possible points if questions were updated
      if (
        updateAssessmentDto.questions &&
        updateAssessmentDto.questions.length > 0
      ) {
        await this.recalculateTotalPoints(assessmentId);
      }

      // Get updated assessment with all relations
      const updatedAssessmentData = await this.getAssessmentById(assessmentId);

      return {
        success: true,
        message: 'Assessment updated successfully',
        data: {
          ...updatedAssessmentData.data,
          updated_items: updatedItems,
        },
      };
    } catch (error) {
      this.logger.error('Error updating assessment:', error);

      // Re-throw known exceptions to preserve their status codes

      //below: added by opeyemi

      if (error instanceof BadRequestException) {
        // Check if it's a service validation error
        if (
          error.message &&
          error.message.includes('Service recommendation validation failed')
        ) {
          this.logger.error(
            'Service validation failed during assessment update:',
            error.message,
          );

          throw BadRequestException.BAD_REQUEST(
            `Service validation failed during update: ${error.message}. Please ensure all referenced services exist in the Services catalog (/services). Create missing services first, then update your assessment.`,
          );
        }

        // Check for assessment not found errors
        if (error.message && error.message.includes('Assessment not found')) {
          throw BadRequestException.BAD_REQUEST(
            `Assessment not found: ${error.message}. Verify the assessment ID is correct and the assessment exists.`,
          );
        }

        // Check for module/question validation errors
        if (
          error.message &&
          error.message.includes('Question type is required')
        ) {
          throw BadRequestException.BAD_REQUEST(
            `Invalid question update configuration: ${error.message}. When updating questions, ensure type and step are provided for new questions. For existing questions, provide the question ID.`,
          );
        }

        // Check for service level configuration errors
        if (
          error.message &&
          error.message.includes('must have at least one level specified')
        ) {
          throw BadRequestException.BAD_REQUEST(
            `Service recommendation update error: ${error.message}. Each service recommendation must specify at least one level (Beginner, Foundational, Intermediate, Advanced, Expert) when updating.`,
          );
        }

        // Check for point calculation errors
        if (error.message && error.message.includes('Failed to recalculate')) {
          throw BadRequestException.BAD_REQUEST(
            `Point calculation error during update: ${error.message}. There was an issue recalculating assessment points after your updates. Please verify your question scoring configuration.`,
          );
        }

        // Log and re-throw other BadRequest exceptions with original message
        //   this.logger.error(
        //     'Assessment update validation error:',
        //     error.message || error.response,
        //   );
        //   throw error;
        // }

        // Handle unexpected errors during update
        this.logger.error('Unexpected error during assessment update:', error);
        throw BadRequestException.BAD_REQUEST(
          `Failed to update assessment: ${error.message}. Please verify your update data and try again. If the issue persists, contact support.`,
        );
        //a
        // if (error instanceof BadRequestException) {
        //   throw error;
        // }

        // // For unknown errors, throw a generic bad request
        // throw BadRequestException.BAD_REQUEST('Failed to update assessment');
      }
    }
  }

  async submitAssessment(
    assessmentId: string,
    userResponses: Record<string, any>,
    userId?: string,
  ) {
    try {
      const assessmentData = await this.getAssessmentById(assessmentId);

      if (!assessmentData?.data) {
        throw BadRequestException.BAD_REQUEST('Assessment not found');
      }

      const { assessment, questions } = assessmentData.data as {
        assessment: any;
        questions: Question[];
      };
      // === 🧠 Step 1: Enforce 2-week retake rule ===
      if (userId) {
        const lastSubmission = await this.userAssessmentRepository.findOne({
          user_id: new Types.ObjectId(userId),
          assessment_id: new Types.ObjectId(assessmentId),
          is_submitted: true,
        });

        if (lastSubmission) {
          const completedAt = new Date(lastSubmission.completed_at);
          const now = new Date();
          const diffInDays = Math.floor(
            (now.getTime() - completedAt.getTime()) / (1000 * 60 * 60 * 24),
          );

          if (diffInDays < 14) {
            const nextEligibleDate = new Date(
              completedAt.getTime() + 14 * 24 * 60 * 60 * 1000,
            );

            setImmediate(async () => {
              try {
                await this.notificationService.notifyAssessmentRetakeLimited(
                  userId,
                  assessment.title,
                  nextEligibleDate,
                );
              } catch (notifyError) {
                this.logger.error(
                  `❌ Failed to notify user ${userId} about retake limitation:`,
                  notifyError.message,
                );
              }
            });
            throw BadRequestException.BAD_REQUEST(
              `You can only retake this assessment after 2 weeks. Next eligible date: ${nextEligibleDate.toDateString()}`,
            );
          }
        }
      }

      // 🛑 Check if published
      if (!assessment.is_published) {
        throw BadRequestException.BAD_REQUEST(
          'This assessment is not published and cannot be submitted',
        );
      }

      // ✅ Use pre-calculated total_possible_points from DB
      const total_possible_points = assessment.total_possible_points || 0;
      // ✅ Calculate user's score
      const userScore = this.calculateUserScore(questions, userResponses);
      const completedAt = new Date();
      // ✅ Determine user level & percentage score
      const percentage_score =
        total_possible_points > 0
          ? (userScore / total_possible_points) * 100
          : 0;
      const userLevel = this.determineUserLevel(
        userScore,
        total_possible_points,
      );

      // ✅ Create question map for easy lookup
      const questionMap = new Map(
        questions.map((q: any) => [q._id.toString(), q]),
      );

      // ✅ Helper function to transform matrix answers
      const transformAnswer = (questionId: string, answer: any) => {
        const question = questionMap.get(questionId);

        if (!question) return answer;

        // Handle matrix questions
        if (
          question.type === QuestionType.MULTIPLE_CHOICE_GRID &&
          typeof answer === 'object' &&
          answer !== null
        ) {
          const formattedAnswer: any = {};

          for (const row of question.grid_rows || []) {
            const selectedColId = answer[row.id];

            const col = question.grid_columns?.find(
              (c: any) => c.id == selectedColId,
            );

            formattedAnswer[row.text] = col?.text || null;
          }

          return formattedAnswer;
        }

        // --- MULTIPLE CHOICE / CHECKBOX ---
        if (
          question.type === QuestionType.MULTIPLE_CHOICE ||
          question.type === QuestionType.CHECKBOX ||
          question.type === QuestionType.DROPDOWN
        ) {
          if (Array.isArray(answer)) {
            return answer.map((optId) => {
              const option = question.options?.find((o) => o.id === optId);
              return option?.text || optId;
            });
          } else if (typeof answer === 'string') {
            const option = question.options?.find((o) => o.id === answer);
            return option?.text || answer;
          }
        }

        // --- TEXT FIELDS ---
        if (
          question.type === QuestionType.SHORT_TEXT ||
          question.type === QuestionType.LONG_TEXT
        ) {
          return answer;
        }

        // --- FILE UPLOAD ---
        if (question.type === QuestionType.FILE_UPLOAD) {
          return answer; // keep URL or file ref
        }

        // Return as-is for text, number, etc.
        return answer;
      };
      // ✅ Convert responses → answers with transformed values
      const answers = Object.entries(userResponses).map(
        ([questionId, answer]) => {
          const question = questionMap.get(questionId);
          return {
            question_id: new Types.ObjectId(questionId),
            question_text: question?.question || 'Unknown Question',
            answer: transformAnswer(questionId, answer),
            original_answer: answer, // Keep original for database
            score: undefined,
          };
        },
      );

      // ✅ Fetch recommendations
      const recommendedServicesResult = await this.getServiceRecommendations(
        assessmentId,
        userScore,
      );
      const recommendedServices = recommendedServicesResult.data;

      // ✅ Save submission
      if (userId) {
        const userAssessmentData = {
          user_id: new Types.ObjectId(userId),
          assessment_id: new Types.ObjectId(assessmentId),
          answers,
          user_score: userScore,
          max_possible_score: total_possible_points,
          percentage_score: Number((percentage_score || 0).toFixed(2)),
          recommended_services: recommendedServices,
          completed_at: completedAt,
          is_submitted: true,
        };

        const dbAnswers = Object.entries(userResponses).map(
          ([questionId, answer]) => ({
            question_id: new Types.ObjectId(questionId),
            answer,
            score: undefined,
          }),
        );

        await this.userAssessmentRepository.findOneAndUpdate(
          {
            user_id: new Types.ObjectId(userId),
            assessment_id: new Types.ObjectId(assessmentId),
          },
          {
            $set: {
              answers: dbAnswers,
              user_score: userScore,
              max_possible_score: total_possible_points,
              percentage_score: Number((percentage_score || 0).toFixed(2)),
              recommended_services: recommendedServices,
              completed_at: completedAt,
              is_submitted: true,
            },
          },
          { upsert: true },
        );

        this.logger.log(
          `User ${userId} completed assessment ${assessmentId} with score ${userScore}`,
        );
      }

      // 📧 Send email and notification in background (non-blocking)
      setImmediate(async () => {
        try {
          const user = userId
            ? await this.userRepository.findById(userId)
            : null;

          const emailPromise = user?.email
            ? this.mailService.sendMail({
                to: user.email,
                subject: `Assessment Completed - ${assessment.title}`,
                text: `Hi ${user.first_name || ''}, you scored ${userScore}/${total_possible_points} in ${assessment.title}.`,
                html: assessmentCompletionEmail(
                  user,
                  assessment.title,
                  userScore,
                  total_possible_points,
                  percentage_score,
                  userLevel,
                  recommendedServices.map((service: any) => ({
                    name: service.service_name || service.name,
                    description: service.description,
                  })),
                ),
              })
            : Promise.resolve();

          const notificationPromise = userId
            ? this.notificationService.notifyAssessmentCompleted(
                userId,
                assessment.title,
                percentage_score,
                assessmentId,
                recommendedServices.map(
                  (service: any) => service.service_name || service.name,
                ),
              )
            : Promise.resolve();

          // ✅ NEW: Notify admins about assessment submission
          const adminNotificationPromise =
            userId && user
              ? this.notificationService.notifyAdminsNewAssessmentSubmission(
                  userId,
                  `${user.first_name} ${user.last_name}`.trim() || user.email,
                  assessment.title,
                  assessmentId,
                  Math.round(percentage_score),
                )
              : Promise.resolve();

          // Run both concurrently — no blocking
          const [emailResult, notificationResult, adminNotificationResult] =
            await Promise.allSettled([
              emailPromise,
              notificationPromise,
              adminNotificationPromise,
            ]);

          if (emailResult.status === 'fulfilled') {
            this.logger.log(
              `✅ Assessment completion email sent to ${user?.email}`,
            );
          } else {
            this.logger.error(
              `❌ Failed to send email to ${user?.email}:`,
              emailResult.reason?.message,
            );
          }

          if (notificationResult.status === 'fulfilled') {
            this.logger.log(`✅ Notification sent to user ${userId}`);
          } else {
            this.logger.error(
              `❌ Failed to send notification to user ${userId}:`,
              notificationResult.reason?.message,
            );
          }

          // ✅ NEW: Log admin notification result
          if (adminNotificationResult.status === 'fulfilled') {
            this.logger.log(
              `✅ Admin notifications sent for assessment ${assessmentId}`,
            );
          } else {
            this.logger.error(
              `❌ Failed to send admin notifications:`,
              adminNotificationResult.reason?.message,
            );
          }
        } catch (error) {
          this.logger.error(
            `❌ Error in background email/notification process:`,
            error.message,
          );
        }
      });

      // ✅ Return immediately without waiting for email/notification
      return {
        success: true,
        message: 'Assessment completed successfully',
        data: {
          // answers: answers.map((a) => ({
          //   question_id: a.question_id,
          //   question_text: a.question_text,
          //   answer: a.answer, // Transformed answer with labels
          // })),
          user_score: userScore,
          total_possible_points,
          percentage_score: Number((percentage_score || 0).toFixed(2)),
          user_level: userLevel,
          recommended_services: recommendedServices,
          assessment_title: assessment.title,
          completed_at: completedAt.toISOString(),
          is_submitted: true,
        },
      };
    } catch (error) {
      this.logger.error('Error submitting assessment:', error);

      // ✅ Don't override the original message if it's already a handled error
      if (error instanceof BadRequestException) {
        throw error;
      }

      // ✅ Also handle native NestJS HttpException (optional)
      if (error.getStatus && error.getStatus() === 400) {
        throw error;
      }
      throw BadRequestException.BAD_REQUEST('Failed to submit assessment');
    }
  }

  async getUserMonthlyStats(userId: string, year?: number): Promise<any> {
    try {
      const currentYear = year || new Date().getFullYear();

      const filter: any = {
        user_id: new Types.ObjectId(userId),
      };

      if (year) {
        filter.completed_at = {
          $gte: new Date(`${year}-01-01T00:00:00.000Z`),
          $lte: new Date(`${year}-12-31T23:59:59.999Z`),
        };
      }

      const stats = await this.userAssessmentModel.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'assessments',
            localField: 'assessment_id',
            foreignField: '_id',
            as: 'assessmentInfo',
          },
        },
        {
          $unwind: {
            path: '$assessmentInfo',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: { $month: '$completed_at' },
            totalScore: { $sum: '$user_score' },
            submissions: { $sum: 1 },
            assessmentDetails: {
              $push: {
                assessment_id: '$assessment_id',
                assessment_title: '$assessmentInfo.title',
                user_score: '$user_score',
                max_possible_score: '$max_possible_score',
                percentage_score: '$percentage_score',
                completed_at: '$completed_at',
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // 📊 Fill all 12 months with default 0
      const allMonths = Array.from({ length: 12 }, (_, i) => ({
        month: new Intl.DateTimeFormat('en', { month: 'short' }).format(
          new Date(currentYear, i),
        ),
        year: currentYear,
        score: 0,
        submissions: 0,
        submission_details: [],
      }));

      // Replace with actual data where it exists
      stats.forEach((s) => {
        const monthIndex = s._id - 1;

        const submissionDetails = s.assessmentDetails.map(
          (assessment: any) => ({
            assessment_name:
              assessment.assessment_title || 'Unnamed Assessment',
            user_score: assessment.user_score,
            max_possible_score: assessment.max_possible_score,
            percentage_score: Number(
              (assessment.percentage_score || 0).toFixed(2),
            ),
            completed_at: assessment.completed_at,
            completed_date: new Date(
              assessment.completed_at,
            ).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            completed_time: new Date(
              assessment.completed_at,
            ).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }),
          }),
        );

        allMonths[monthIndex] = {
          month: allMonths[monthIndex].month,
          year: currentYear,
          score: Math.round(s.totalScore / s.submissions),
          submissions: s.submissions,
          submission_details: submissionDetails,
        };
      });

      const totalSubmissions = stats.reduce((sum, s) => sum + s.submissions, 0);
      const overallAverageScore =
        totalSubmissions > 0
          ? Math.round(
              stats.reduce((sum, s) => sum + s.totalScore, 0) /
                totalSubmissions,
            )
          : 0;

      return {
        success: true,
        message: 'Monthly stats retrieved successfully',
        data: {
          year: currentYear,
          summary: {
            total_submissions: totalSubmissions,
            overall_average_score: overallAverageScore,
            months_active: stats.length,
          },
          monthly_breakdown: allMonths,
          generated_at: new Date().toISOString(),
          generated_date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          generated_time: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          }),
        },
      };
    } catch (error) {
      this.logger.error('Error getting monthly stats:', error);
      throw BadRequestException.BAD_REQUEST('Failed to retrieve monthly stats');
    }
  }

  async getUserYearlyStats(userId: string): Promise<any> {
    try {
      const currentYear = new Date().getFullYear();
      // Calculate the starting year (current year - 5) for 6 years of data
      const startYear = currentYear - 5;

      // 1. Setup the initial filter for the last 6 years
      const filter: any = {
        user_id: new Types.ObjectId(userId),
        completed_at: {
          $gte: new Date(`${startYear}-01-01T00:00:00.000Z`),
          $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`),
        },
      };

      const stats = await this.userAssessmentModel.aggregate([
        { $match: filter },
        // 2. Group by the year of the 'completed_at' date
        {
          $group: {
            _id: { $year: '$completed_at' }, // Grouping key is the year
            totalScore: { $sum: '$user_score' },
            totalMaxPossibleScore: { $sum: '$max_possible_score' },
            submissions: { $sum: 1 },
          },
        },
        // 3. Sort by year (ascending)
        { $sort: { _id: 1 } },
      ]);

      // 4. Fill all 6 years with default 0 data
      const allYears = Array.from({ length: 6 }, (_, i) => ({
        year: startYear + i,
        average_score: 0,
        submissions: 0,
      }));

      // 5. Replace defaults with actual aggregated data and calculate averages
      stats.forEach((s) => {
        const yearIndex = s._id - startYear;

        // Ensure the year is within the 6-year range
        if (yearIndex >= 0 && yearIndex < 6) {
          const averageScore =
            s.submissions > 0 ? Math.round(s.totalScore / s.submissions) : 0;

          allYears[yearIndex] = {
            year: s._id,
            average_score: averageScore,
            submissions: s.submissions,
          };
        }
      });

      // 6. Calculate overall summary
      const totalSubmissions = allYears.reduce(
        (sum, s) => sum + s.submissions,
        0,
      );

      return {
        success: true,
        message: 'Yearly stats retrieved successfully',
        data: {
          start_year: startYear,
          end_year: currentYear,
          summary: {
            total_submissions: totalSubmissions,
            // Note: Calculating a combined overall average from annual averages isn't ideal,
            // a true overall average requires re-aggregating the raw data's total scores.
            // For simplicity, we'll keep the breakdown as the main focus.
            years_active: stats.length,
          },
          yearly_breakdown: allYears,
          generated_at: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error('Error getting yearly stats:', error);
      // Assuming BadRequestException is defined in your environment
      throw BadRequestException.BAD_REQUEST('Failed to retrieve yearly stats');
    }
  }

  async getSubmittedAssessments(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<any> {
    try {
      const skip = (page - 1) * limit;

      // Build aggregation pipeline
      const pipeline: any[] = [
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user_details',
          },
        },
        {
          $lookup: {
            from: 'assessments',
            localField: 'assessment_id',
            foreignField: '_id',
            as: 'assessment_details',
          },
        },
        {
          $unwind: {
            path: '$user_details',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$assessment_details',
            preserveNullAndEmptyArrays: true,
          },
        },
      ];

      // 🔍 Search filtering
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        pipeline.push({
          $match: {
            $or: [
              { 'user_details.first_name': searchRegex },
              { 'user_details.last_name': searchRegex },
              { 'user_details.email': searchRegex },
              { 'user_details.business_name': searchRegex },
              { 'assessment_details.title': searchRegex },
              {
                $expr: {
                  $regexMatch: {
                    input: {
                      $concat: [
                        '$user_details.first_name',
                        ' ',
                        '$user_details.last_name',
                      ],
                    },
                    regex: search,
                    options: 'i',
                  },
                },
              },
            ],
          },
        });
      }

      // Get total count
      const countPipeline = [...pipeline, { $count: 'total' }];
      const countResult =
        await this.userAssessmentModel.aggregate(countPipeline);
      const totalCount = countResult.length > 0 ? countResult[0].total : 0;

      // Add sorting and pagination
      pipeline.push(
        { $sort: { completed_at: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            assessment_id: 1,
            user_id: 1,
            answers: 1, // ✅ Include answers
            user_score: 1,
            max_possible_score: 1,
            percentage_score: 1,
            completed_at: 1,
            submitted_at: 1,
            time_taken_seconds: 1,
            user: {
              _id: '$user_details._id',
              first_name: '$user_details.first_name',
              last_name: '$user_details.last_name',
              email: '$user_details.email',
              phone_number: '$user_details.phone_number',
              business_name: '$user_details.business_name',
              profile_picture: '$user_details.profile_picture',
              organization: '$user_details.organization',
            },
            assessment: {
              _id: '$assessment_details._id',
              title: '$assessment_details.title',
              description: '$assessment_details.description',
              total_possible_points:
                '$assessment_details.total_possible_points',
              is_published: '$assessment_details.is_published',
            },
          },
        },
      );

      // Fetch submissions
      const submissions = await this.userAssessmentModel.aggregate(pipeline);

      // ✅ Transform answers for each submission
      const transformedSubmissions = await Promise.all(
        submissions.map(async (submission) => {
          let formattedAnswers = [];

          if (submission.answers && submission.answers.length > 0) {
            // Fetch questions for this assessment
            const questions = await this.questionRepository.find({
              assessment_id: submission.assessment_id,
            });

            const questionMap = new Map(
              questions.map((q: any) => [q._id.toString(), q]),
            );

            // Transform each answer
            formattedAnswers = submission.answers.map((ans: any) => {
              const question = questionMap.get(ans.question_id.toString());

              if (!question) {
                return {
                  question_text: 'Unknown Question',
                  answer: ans.answer,
                };
              }

              let formattedAnswer = ans.answer;

              // Handle matrix/grid questions
              if (
                question.type === QuestionType.MULTIPLE_CHOICE_GRID &&
                typeof ans.answer === 'object' &&
                ans.answer !== null
              ) {
                const gridAnswer: any = {};

                for (const row of question.grid_rows || []) {
                  const selectedColId = ans.answer[row.id];
                  const col = question.grid_columns?.find(
                    (c: any) => c.id === selectedColId,
                  );
                  gridAnswer[row.text] = col?.text || 'Not answered';
                }

                formattedAnswer = gridAnswer;
              }
              // Handle multiple choice/checkbox
              else if (
                question.type === QuestionType.MULTIPLE_CHOICE ||
                question.type === QuestionType.CHECKBOX ||
                question.type === QuestionType.DROPDOWN
              ) {
                if (Array.isArray(ans.answer)) {
                  formattedAnswer = ans.answer.map((optId) => {
                    const option = question.options?.find(
                      (o: any) => o.id === optId,
                    );
                    return option?.text || optId;
                  });
                } else if (typeof ans.answer === 'string') {
                  const option = question.options?.find(
                    (o: any) => o.id === ans.answer,
                  );
                  formattedAnswer = option?.text || ans.answer;
                }
              }

              return {
                question_id: ans.question_id,
                question_text: question.question,
                question_type: question.type,
                answer: formattedAnswer,
              };
            });
          }

          return {
            submission_id: submission._id,
            assessment: submission.assessment,
            user: submission.user,
            scores: {
              user_score: submission.user_score,
              max_possible_score: submission.max_possible_score,
              percentage_score: Number(
                (submission.percentage_score || 0).toFixed(2),
              ),
            },
            answers: formattedAnswers, // ✅ Formatted answers with questions
            completed_at: submission.completed_at,
            completed_date: new Date(
              submission.completed_at,
            ).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            completed_time: new Date(
              submission.completed_at,
            ).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }),
            time_taken_seconds: submission.time_taken_seconds,
          };
        }),
      );

      // Calculate statistics
      const stats = await this.userAssessmentModel.aggregate([
        {
          $group: {
            _id: null,
            total_submissions: { $sum: 1 },
            average_score: { $avg: '$user_score' },
            highest_score: { $max: '$user_score' },
            lowest_score: { $min: '$user_score' },
            average_percentage: { $avg: '$percentage_score' },
          },
        },
      ]);

      const statistics =
        stats.length > 0
          ? stats[0]
          : {
              total_submissions: 0,
              average_score: 0,
              highest_score: 0,
              lowest_score: 0,
              average_percentage: 0,
            };

      return {
        success: true,
        message: 'Submitted assessments retrieved successfully',
        data: {
          submissions: transformedSubmissions,
          pagination: {
            current_page: page,
            per_page: limit,
            total_items: totalCount,
            total_pages: Math.ceil(totalCount / limit),
            has_next_page: page < Math.ceil(totalCount / limit),
            has_previous_page: page > 1,
          },
          statistics: {
            total_submissions: statistics.total_submissions,
            average_score: Math.round(statistics.average_score * 100) / 100,
            highest_score: statistics.highest_score,
            lowest_score: statistics.lowest_score,
            average_percentage:
              Math.round(statistics.average_percentage * 100) / 100,
          },
          search_applied: search || null,
          generated_at: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error('Error getting submitted assessments:', error);
      throw BadRequestException.BAD_REQUEST(
        'Failed to retrieve submitted assessments',
      );
    }
  }

  async getAllAssessmentsMonthlyStats(year?: number): Promise<any> {
    try {
      const currentYear = year || new Date().getFullYear();

      // 🧮 Filter for completed assessments within the given year
      const filter: any = {};
      if (year) {
        filter.completed_at = {
          $gte: new Date(`${year}-01-01T00:00:00.000Z`),
          $lte: new Date(`${year}-12-31T23:59:59.999Z`),
        };
      }

      const stats = await this.userAssessmentModel.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'assessments',
            localField: 'assessment_id',
            foreignField: '_id',
            as: 'assessmentInfo',
          },
        },
        {
          $unwind: {
            path: '$assessmentInfo',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: { $month: '$completed_at' },
            totalScore: { $sum: '$user_score' },
            submissions: { $sum: 1 },
            assessmentDetails: {
              $push: {
                assessment_title: '$assessmentInfo.title',
                user_score: '$user_score',
                max_possible_score: '$max_possible_score',
                percentage_score: '$percentage_score',
                completed_at: '$completed_at',
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // 📆 Initialize all 12 months with defaults
      const allMonths = Array.from({ length: 12 }, (_, i) => ({
        month: new Intl.DateTimeFormat('en', { month: 'short' }).format(
          new Date(currentYear, i),
        ),
        year: currentYear,
        average_score: 0,
        submissions: 0,
        submission_details: [],
      }));

      // 🧩 Populate actual data for months with submissions
      stats.forEach((s) => {
        const monthIndex = s._id - 1;

        const submissionDetails = s.assessmentDetails.map(
          (assessment: any) => ({
            assessment_name:
              assessment.assessment_title || 'Unnamed Assessment',
            user_score: assessment.user_score,
            max_possible_score: assessment.max_possible_score,
            percentage_score: Number(
              (assessment.percentage_score || 0).toFixed(2),
            ),
            completed_date: new Date(
              assessment.completed_at,
            ).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            completed_time: new Date(
              assessment.completed_at,
            ).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }),
          }),
        );

        allMonths[monthIndex] = {
          month: allMonths[monthIndex].month,
          year: currentYear,
          average_score: Math.round(s.totalScore / s.submissions),
          submissions: s.submissions,
          submission_details: submissionDetails,
        };
      });

      // 📊 Summary calculations
      const totalSubmissions = stats.reduce((sum, s) => sum + s.submissions, 0);
      const overallAverageScore =
        totalSubmissions > 0
          ? Math.round(
              stats.reduce((sum, s) => sum + s.totalScore, 0) /
                totalSubmissions,
            )
          : 0;

      return {
        success: true,
        message: 'All assessment submission stats retrieved successfully',
        data: {
          year: currentYear,
          summary: {
            total_submissions: totalSubmissions,
            overall_average_score: overallAverageScore,
            months_with_submissions: stats.length,
          },
          monthly_breakdown: allMonths,
          generated_at: new Date().toISOString(),
          generated_date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          generated_time: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          }),
        },
      };
    } catch (error) {
      this.logger.error('Error getting all assessment stats:', error);
      throw BadRequestException.BAD_REQUEST(
        'Failed to retrieve assessment stats',
      );
    }
  }

  async getAllAssessmentsYearlyStats(): Promise<any> {
    try {
      const currentYear = new Date().getFullYear();
      // Calculate the starting year (current year - 5) for 6 years of data
      const startYear = currentYear - 5;

      // 🧮 Filter for completed assessments within the last 6 years
      const filter: any = {
        completed_at: {
          $gte: new Date(`${startYear}-01-01T00:00:00.000Z`),
          $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`),
        },
      };

      const stats = await this.userAssessmentModel.aggregate([
        { $match: filter },
        // 1. Group by the year of the 'completed_at' date
        {
          $group: {
            _id: { $year: '$completed_at' }, // Grouping key is the year
            totalScore: { $sum: '$user_score' },
            submissions: { $sum: 1 },
          },
        },
        // 2. Sort by year (ascending)
        { $sort: { _id: 1 } },
      ]);

      // 3. Fill all 6 years with default 0 data
      const allYears = Array.from({ length: 6 }, (_, i) => ({
        year: startYear + i,
        average_score: 0,
        submissions: 0,
      }));

      // 4. Replace defaults with actual aggregated data and calculate averages
      stats.forEach((s) => {
        const yearIndex = s._id - startYear;

        // Ensure the year is within the 6-year range
        if (yearIndex >= 0 && yearIndex < 6) {
          const averageScore =
            s.submissions > 0 ? Math.round(s.totalScore / s.submissions) : 0;

          allYears[yearIndex] = {
            year: s._id,
            average_score: averageScore,
            submissions: s.submissions,
          };
        }
      });

      // 5. Summary calculations
      const totalSubmissions = allYears.reduce(
        (sum, s) => sum + s.submissions,
        0,
      );

      return {
        success: true,
        message: 'All assessment yearly stats retrieved successfully',
        data: {
          start_year: startYear,
          end_year: currentYear,
          summary: {
            total_submissions: totalSubmissions,
            years_with_submissions: stats.length,
          },
          yearly_breakdown: allYears,
          generated_at: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error('Error getting all assessment yearly stats:', error);
      throw BadRequestException.BAD_REQUEST(
        'Failed to retrieve all assessment yearly stats',
      );
    }
  }

  async deleteAssessment(assessmentId: string): Promise<any> {
    try {
      if (!Types.ObjectId.isValid(assessmentId)) {
        throw BadRequestException.BAD_REQUEST('Invalid assessment ID format');
      }

      const assessment = await this.assessmentRepository.findById(assessmentId);

      if (!assessment) {
        throw new NotFoundException('Assessment not found');
      }

      // ✅ Prevent deletion of published assessments
      if (assessment.is_published) {
        throw BadRequestException.BAD_REQUEST(
          'Cannot delete a published assessment. Please unpublish it first.',
        );
      }

      // ✅ Check if there are any user submissions for this assessment
      const submissionsCount = await this.userAssessmentModel.countDocuments({
        assessment_id: new Types.ObjectId(assessmentId),
      });

      if (submissionsCount > 0) {
        throw BadRequestException.BAD_REQUEST(
          `Cannot delete this assessment. It has ${submissionsCount} user submission(s). Consider unpublishing instead.`,
        );
      }

      // Delete related data in order
      const assessmentObjectId = new Types.ObjectId(assessmentId);

      // 1. Delete all questions
      const deletedQuestions = await this.questionRepository.deleteMany({
        assessment_id: assessmentObjectId,
      });

      // 2. Delete all modules
      const deletedModules = await this.assessmentModuleRepository.deleteMany({
        assessment_id: assessmentObjectId,
      });

      // 3. Delete service recommendations
      const deletedRecommendations =
        await this.serviceRecommendationRepository.deleteMany({
          assessment_id: assessmentObjectId,
        });

      // 4. Finally, delete the assessment itself
      await this.assessmentRepository.delete({
        _id: assessmentObjectId,
      });

      this.logger.log(
        `Assessment ${assessmentId} deleted successfully along with ${deletedQuestions.deletedCount} questions, ${deletedModules.deletedCount} modules, and ${deletedRecommendations.deletedCount} recommendations`,
      );

      return {
        success: true,
        message: 'Assessment deleted successfully',
        data: {
          deleted_assessment_id: assessmentId,
          deleted_assessment_title: assessment.title,
          deleted_items: {
            questions: deletedQuestions.deletedCount || 0,
            modules: deletedModules.deletedCount || 0,
            recommendations: deletedRecommendations.deletedCount || 0,
          },
        },
      };
    } catch (error) {
      this.logger.error('Error deleting assessment:', error);

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw BadRequestException.BAD_REQUEST('Failed to delete assessment');
    }
  }
}
