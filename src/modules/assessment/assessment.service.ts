/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/only-throw-error */
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
// import {
//   SubmitAssessmentDto,
//   SubmitAssessmentResDto,
// } from './dto/submit-assessment.dto';
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
    private readonly serviceRecommendationRepository: BaseRepository<any>, // Define proper type
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
    if (question.welcome_message)
      base.welcome_message = question.welcome_message;
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
      categories: service.categories || [],
      priority: service.priority,
      assessment_id: service.assessment_id,
    };
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
              welcome_message: welcomeDto.welcome_message,
              button_text: welcomeDto.button_text,
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

      // Step 4: Create service recommendations (if repository is available)
      const createdServiceRecommendations: any[] = [];

      if (
        createAssessmentDto.service_recommendations &&
        createAssessmentDto.service_recommendations.length > 0
      ) {
        for (const serviceDto of createAssessmentDto.service_recommendations) {
          const serviceData = {
            assessment_id: assessment._id as Types.ObjectId,
            service_id: serviceDto.service_id,
            service_name: serviceDto.service_name,
            description: serviceDto.description,
            min_points: serviceDto.min_points,
            max_points: serviceDto.max_points,
            categories: serviceDto.categories || [],
            priority: serviceDto.priority,
          };

          // Uncomment when service recommendation repository is available
          const serviceRecommendation =
            await this.serviceRecommendationRepository.create(serviceData);
          createdServiceRecommendations.push(serviceRecommendation);

          this.logger.log(
            `Service recommendation planned: ${serviceDto.service_name} (${serviceDto.min_points}-${serviceDto.max_points} pts)`,
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

  // Enhanced scoring calculation methods
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
      const recommendations = await this.serviceRecommendationRepository.find(
        {
          assessment_id: new Types.ObjectId(assessmentId),
          min_points: { $lte: userScore },
          max_points: { $gte: userScore },
        },
        null, // projection
        { sort: { priority: 1 } },
      );

      // For now, return empty array
      // const recommendations: any[] = [];

      return {
        success: true,
        data: recommendations,
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

  async deleteQuestion(questionId: string): Promise<any> {
    try {
      const result = await this.questionRepository.delete({
        _id: new Types.ObjectId(questionId),
      });

      return {
        success: true,
        message: 'Question deleted successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Error deleting question:', error);
      throw BadRequestException.BAD_REQUEST('Failed to delete question');
    }
  }

  async updateQuestion(
    questionId: string,
    updateData: Partial<QuestionDocument>,
  ): Promise<any> {
    try {
      const question = await this.questionRepository.update(
        { _id: new Types.ObjectId(questionId) },
        { ...updateData, updated_at: new Date() },
      );

      if (!question) {
        throw BadRequestException.RESOURCE_NOT_FOUND('Question not found');
      }

      return {
        success: true,
        message: 'Question updated successfully',
        data: question,
      };
    } catch (error) {
      this.logger.error('Error updating question:', error);
      throw BadRequestException.BAD_REQUEST('Failed to update question');
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
}
