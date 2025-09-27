/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { Injectable, Inject, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { Repositories } from '../../shared/enums/db.enum';
import { BaseRepository } from '../repository/base.repository';
import { AssessmentDocument } from './schemas/assessment.schema';
import { AssessmentModuleDocument } from './schemas/assessment-module.schema';
import { QuestionDocument } from './schemas/question.schema';
import { UserAssessmentDocument } from './schemas/user-assessment.schema';
import {
  CreateAssessmentDto,
  CreateAssessmentResDto,
  CreateCheckboxQuestionDto,
  CreateDropdownQuestionDto,
  CreateLongTextQuestionDto,
  CreateModuleTitleDto,
  CreateMultipleChoiceGridQuestionDto,
  CreateMultipleChoiceQuestionDto,
  CreateShortTextQuestionDto,
  CreateWelcomeScreenDto,
  // ServiceRecommendationDto,
} from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { BadRequestException } from 'src/exceptions';
import { QuestionType } from './enums/question-type.enum';

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
  ) {}

  // Add these methods to your AssessmentService class

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
    if (question.max_length) base.max_length = question.max_length;
    if (question.min_length) base.min_length = question.min_length;
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
            return total + (question.max_points || 0);
        }
      }, 0);
  }

  private calculateMultipleChoiceMaxPoints(options: any[]): number {
    if (!options || options.length === 0) return 0;
    return Math.max(...options.map((option) => option.points || 0));
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
        moduleMapping.set(moduleDto.temp_id, newModule._id as Types.ObjectId);
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
        if (questionDto.max_length !== undefined)
          updateData.max_length = questionDto.max_length;
        if (questionDto.min_length !== undefined)
          updateData.min_length = questionDto.min_length;
        if (questionDto.completion_points !== undefined) {
          updateData.completion_points = questionDto.completion_points;
          updateData.max_points = questionDto.completion_points;
        }
        break;

      case QuestionType.LONG_TEXT:
        if (questionDto.placeholder !== undefined)
          updateData.placeholder = questionDto.placeholder;
        if (questionDto.max_length !== undefined)
          updateData.max_length = questionDto.max_length;
        if (questionDto.min_length !== undefined)
          updateData.min_length = questionDto.min_length;
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
          max_length: questionDto.max_length,
          min_length: questionDto.min_length,
          completion_points: questionDto.completion_points || 0,
          max_points: questionDto.completion_points || 0,
        };
        break;

      case QuestionType.LONG_TEXT:
        questionData = {
          ...baseQuestionData,
          placeholder: questionDto.placeholder,
          max_length: questionDto.max_length,
          min_length: questionDto.min_length,
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
        if (serviceDto.categories !== undefined)
          updateData.categories = serviceDto.categories;
        if (serviceDto.priority !== undefined)
          updateData.priority = serviceDto.priority;

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
          categories: serviceDto.categories || [],
          priority: serviceDto.priority,
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

  async createAssessment(
    createAssessmentDto: CreateAssessmentDto,
    userId: string,
  ): Promise<CreateAssessmentResDto> {
    try {
      // Calculate total possible points first
      const totalPossiblePoints = this.calculateTotalPossiblePoints(
        createAssessmentDto.questions,
      );

      // Step 1: Create the assessment with enhanced data
      const assessmentData = {
        title: createAssessmentDto.title,
        description: createAssessmentDto.description,
        instruction: createAssessmentDto.instruction,
        is_active: createAssessmentDto.is_active ?? true,
        created_by: new Types.ObjectId(userId),
        total_possible_points: totalPossiblePoints,
      };

      const assessment = await this.assessmentRepository.create(assessmentData);
      this.logger.log(
        `Assessment created with ID: ${assessment._id} and ${totalPossiblePoints} total points`,
      );

      // Step 2: Create modules and maintain a mapping for reference
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
        moduleMapping.set(moduleDto.temp_id, module._id as Types.ObjectId);
        createdModules.push(module);

        this.logger.log(
          `Module created: ${moduleDto.temp_id} -> ${module._id} with ${moduleData.max_points} points`,
        );
      }

      // Step 3: Create questions using the module mapping with enhanced scoring
      const createdQuestions: QuestionDocument[] = [];

      for (const questionDto of createAssessmentDto.questions) {
        const moduleId = moduleMapping.get(questionDto.module_ref);

        if (!moduleId && questionDto.module_ref !== 'none') {
          this.logger.warn(
            `Module reference not found: ${questionDto.module_ref}`,
          );
          continue;
        }

        // Base question data that all question types have
        const baseQuestionData = {
          assessment_id: assessment._id as Types.ObjectId,
          module_id: moduleId || undefined,
          type: questionDto.type,
          question: questionDto.question,
          description: questionDto.description,
          instruction: questionDto.instruction,
          is_required: questionDto.is_required ?? false,
          step: questionDto.step,
          max_points: questionDto.max_points || 0,
          scoring_categories: questionDto.scoring_categories || [],
          is_active: questionDto.is_active ?? true,
        };

        // Type-specific data handling with enhanced scoring
        let questionData: any = { ...baseQuestionData };

        switch (questionDto.type) {
          case QuestionType.WELCOME_SCREEN: {
            const welcomeDto = questionDto as CreateWelcomeScreenDto;
            questionData = {
              ...baseQuestionData,
              welcome_title: welcomeDto.welcome_title,
              welcome_description: welcomeDto.welcome_description,
              welcome_instruction: welcomeDto.welcome_instruction,
            };
            break;
          }

          case QuestionType.MODULE_TITLE: {
            const moduleTitleDto = questionDto as CreateModuleTitleDto;
            questionData = {
              ...baseQuestionData,
              module_title: moduleTitleDto.module_title,
              module_description: moduleTitleDto.module_description,
            };
            break;
          }

          case QuestionType.MULTIPLE_CHOICE: {
            const multipleChoiceDto =
              questionDto as CreateMultipleChoiceQuestionDto;
            questionData = {
              ...baseQuestionData,
              options: multipleChoiceDto.options || [],
              max_points: this.calculateMultipleChoiceMaxPoints(
                multipleChoiceDto.options,
              ),
            };
            break;
          }

          case QuestionType.CHECKBOX: {
            const checkboxDto = questionDto as CreateCheckboxQuestionDto;
            questionData = {
              ...baseQuestionData,
              options: checkboxDto.options || [],
              min_selections: checkboxDto.min_selections,
              max_selections: checkboxDto.max_selections,
              scoring_method: checkboxDto.scoring_method || 'sum',
              max_points: this.calculateCheckboxMaxPoints(
                checkboxDto.options,
                checkboxDto.scoring_method,
                checkboxDto.max_selections,
              ),
            };
            break;
          }

          case QuestionType.DROPDOWN: {
            const dropdownDto = questionDto as CreateDropdownQuestionDto;
            questionData = {
              ...baseQuestionData,
              options: dropdownDto.options || [],
              placeholder: dropdownDto.placeholder,
              max_points: this.calculateMultipleChoiceMaxPoints(
                dropdownDto.options,
              ),
            };
            break;
          }

          case QuestionType.SHORT_TEXT: {
            const shortTextDto = questionDto as CreateShortTextQuestionDto;
            questionData = {
              ...baseQuestionData,
              placeholder: shortTextDto.placeholder,
              max_length: shortTextDto.max_length,
              min_length: shortTextDto.min_length,
              completion_points: shortTextDto.completion_points || 0,
              max_points: shortTextDto.completion_points || 0,
            };
            break;
          }

          case QuestionType.LONG_TEXT: {
            const longTextDto = questionDto as CreateLongTextQuestionDto;
            questionData = {
              ...baseQuestionData,
              placeholder: longTextDto.placeholder,
              max_length: longTextDto.max_length,
              min_length: longTextDto.min_length,
              rows: longTextDto.rows,
              completion_points: longTextDto.completion_points || 0,
              keyword_scoring: longTextDto.keyword_scoring || [],
              max_points: this.calculateLongTextMaxPoints(
                longTextDto.completion_points,
                longTextDto.keyword_scoring,
              ),
            };
            break;
          }

          case QuestionType.MULTIPLE_CHOICE_GRID: {
            const gridDto = questionDto as CreateMultipleChoiceGridQuestionDto;
            questionData = {
              ...baseQuestionData,
              grid_columns: gridDto.grid_columns || [],
              grid_rows: gridDto.grid_rows || [],
              max_points: this.calculateGridMaxPoints(
                gridDto.grid_columns,
                gridDto.grid_rows,
              ),
            };
            break;
          }

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

      // Step 4: Create service recommendations
      const createdServiceRecommendations: any[] = [];

      if (
        createAssessmentDto.service_recommendations &&
        createAssessmentDto.service_recommendations.length > 0
      ) {
        for (const serviceDto of createAssessmentDto.service_recommendations) {
          // Validate level array is not empty
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
          assessment: this.mapAssessmentResponse(assessment),
          modules: createdModules.map(this.mapModuleResponse),
          questions: createdQuestions.map(this.mapQuestionResponse),
          service_recommendations: createdServiceRecommendations.map(
            this.mapServiceResponse,
          ),
        },
      };
    } catch (error) {
      this.logger.error('Error creating assessment:', error);
      throw BadRequestException.BAD_REQUEST(
        'Failed to create assessment with modules and questions',
      );
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

  async getAssessmentById(assessmentId: string): Promise<any> {
    try {
      const assessment = await this.assessmentRepository.findById(assessmentId);
      if (!assessment) {
        throw BadRequestException.RESOURCE_NOT_FOUND('Assessment not found');
      }

      const moduleFilter: any = {
        assessment_id: new Types.ObjectId(assessmentId),
      };

      const questionFilter: any = {
        assessment_id: new Types.ObjectId(assessmentId),
      };

      const modules = await this.assessmentModuleRepository.find(moduleFilter);
      const questions = await this.questionRepository.find(questionFilter);

      // Get service recommendations (when repository is available)
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
          // total_possible_points: assessment.total_possible_points || 0,
        },
      };
    } catch (error) {
      this.logger.error('Error getting assessment:', error);
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
            totalScore += selectedOption.points || 0;
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
              (sum: number, opt: any) => sum + (opt.points || 0),
              0,
            );
          } else if (question.scoring_method === 'average') {
            const avgScore =
              selectedOptions.reduce(
                (sum: number, opt: any) => sum + (opt.points || 0),
                0,
              ) / selectedOptions.length;
            totalScore += avgScore || 0;
          } else if (question.scoring_method === 'max') {
            totalScore += Math.max(
              ...selectedOptions.map((opt: any) => opt.points || 0),
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

        case QuestionType.MULTIPLE_CHOICE_GRID:
          if (response && typeof response === 'object') {
            Object.entries(response).forEach(([rowId, columnId]) => {
              const row = question.grid_rows?.find((r: any) => r.id === rowId);
              const column = question.grid_columns?.find(
                (c: any) => c.id === columnId,
              );
              if (row && column) {
                totalScore += (column.points || 0) * (row.weight || 1);
              }
            });
          }
          break;
      }
    });

    return Math.round(totalScore);
  }

  // Method to get service recommendations for a user's score
  async getServiceRecommendations(assessmentId: string, userScore: number) {
    try {
      // Uncomment when service recommendation repository is available
      const recommendations = await this.serviceRecommendationRepository.find({
        assessment_id: new Types.ObjectId(assessmentId),
        min_points: { $lte: userScore },
        max_points: { $gte: userScore },
      });

      // Custom sort order for levels
      const levelOrder: Record<string, number> = {
        Beginner: 1,
        Foundational: 2,
        Intermediate: 3,
        Advanced: 4,
      };

      const sortedRecommendations = recommendations.sort(
        (a, b) => (levelOrder[a.level] ?? 999) - (levelOrder[b.level] ?? 999),
      );

      return {
        success: true,
        data: sortedRecommendations,
        user_score: userScore,
      };
    } catch (error) {
      this.logger.error('Error fetching service recommendations:', error);
      throw BadRequestException.BAD_REQUEST(
        'Failed to fetch service recommendations',
      );
    }
  }

  // Method to submit assessment and get recommendations
  async submitAssessment(
    assessmentId: string,
    userResponses: any,
    userId?: string,
  ) {
    try {
      const assessmentData = await this.getAssessmentById(assessmentId);
      const questions = assessmentData.data.questions;

      const userScore = this.calculateUserScore(questions, userResponses);
      const recommendedServices = await this.getServiceRecommendations(
        assessmentId,
        userScore,
      );

      // Save the user's submission
      if (userId) {
        const userAssessmentData = {
          user_id: new Types.ObjectId(userId),
          assessment_id: new Types.ObjectId(assessmentId),
          responses: userResponses,
          score: userScore,
          completed_at: new Date(),
        };

        await this.userAssessmentRepository.create(userAssessmentData);
        this.logger.log(
          `User ${userId} completed assessment ${assessmentId} with score ${userScore}`,
        );
      }

      return {
        success: true,
        message: 'Assessment completed successfully',
        data: {
          user_score: userScore,
          total_possible_points: assessmentData.data.total_possible_points,
          percentage_score: Math.round(
            (userScore / assessmentData.data.total_possible_points) * 100,
          ),
          recommended_services: recommendedServices.data,
          assessment_title: assessmentData.data.assessment.title,
        },
      };
    } catch (error) {
      this.logger.error('Error submitting assessment:', error);
      throw BadRequestException.BAD_REQUEST('Failed to submit assessment');
    }
  }

  // Existing methods remain unchanged
  async getAvailableAssessments(): Promise<any> {
    try {
      const filter: any = {
        is_active: true,
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

  async getUserAssessments(userId: string): Promise<any> {
    try {
      const filter: any = {
        user_id: new Types.ObjectId(userId),
      };

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
      if (error instanceof BadRequestException) {
        throw error;
      }

      // For unknown errors, throw a generic bad request
      throw BadRequestException.BAD_REQUEST('Failed to update assessment');
    }
  }
}
