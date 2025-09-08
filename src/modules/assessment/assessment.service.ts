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
  ) {}

  // async createAssessment(
  //   createAssessmentDto: CreateAssessmentDto,
  //   userId: string,
  // ): Promise<CreateAssessmentResDto> {
  //   try {
  //     // Step 1: Create the assessment
  //     const assessmentData = {
  //       title: createAssessmentDto.title,
  //       description: createAssessmentDto.description,
  //       instruction: createAssessmentDto.instruction,
  //       is_active: createAssessmentDto.is_active ?? true,
  //       created_by: new Types.ObjectId(userId),
  //     };

  //     const assessment = await this.assessmentRepository.create(assessmentData);
  //     this.logger.log(`Assessment created with ID: ${assessment._id}`);

  //     // Step 2: Create modules and maintain a mapping for reference
  //     const moduleMapping = new Map<string, Types.ObjectId>();
  //     const createdModules: AssessmentModuleDocument[] = [];

  //     for (const moduleDto of createAssessmentDto.modules) {
  //       const moduleData = {
  //         assessment_id: assessment._id as Types.ObjectId,
  //         title: moduleDto.title,
  //         description: moduleDto.description,
  //         order: moduleDto.order,
  //       };

  //       const module = await this.assessmentModuleRepository.create(moduleData);
  //       moduleMapping.set(moduleDto.temp_id, module._id as Types.ObjectId);
  //       createdModules.push(module);

  //       this.logger.log(
  //         `Module created: ${moduleDto.temp_id} -> ${module._id}`,
  //       );
  //     }

  //     // Step 3: Create questions using the module mapping
  //     const createdQuestions: QuestionDocument[] = [];

  //     for (const questionDto of createAssessmentDto.questions) {
  //       const moduleId = moduleMapping.get(questionDto.module_ref);

  //       if (!moduleId && questionDto.module_ref !== 'none') {
  //         this.logger.warn(
  //           `Module reference not found: ${questionDto.module_ref}`,
  //         );
  //         continue;
  //       }

  //       const questionData = {
  //         assessment_id: assessment._id as Types.ObjectId,
  //         module_id: moduleId || undefined,
  //         type: questionDto.type,
  //         question: questionDto.question,
  //         description: questionDto.description,
  //         instruction: questionDto.instruction,
  //         options: questionDto.options || [],
  //         grid_columns: questionDto.grid_columns || [],
  //         grid_rows: questionDto.grid_rows || [],
  //         is_required: questionDto.is_required ?? false,
  //         step: questionDto.step,
  //         required_score: questionDto.required_score ?? 0,
  //         is_active: questionDto.is_active ?? true,
  //       };

  //       const question = await this.questionRepository.create(questionData);
  //       createdQuestions.push(question);

  //       this.logger.log(`Question created for step ${questionDto.step}`);
  //     }

  //     return {
  //       success: true,
  //       message: 'Assessment with modules and questions created successfully',
  //       data: {
  //         assessment,
  //         modules: createdModules,
  //         questions: createdQuestions,
  //       },
  //     };
  //   } catch (error) {
  //     this.logger.error('Error creating assessment:', error);
  //     throw BadRequestException.BAD_REQUEST(
  //       'Failed to create assessment with modules and questions',
  //     );
  //   }
  // }

  async createAssessment(
    createAssessmentDto: CreateAssessmentDto,
    userId: string,
  ): Promise<CreateAssessmentResDto> {
    try {
      // Step 1: Create the assessment
      const assessmentData = {
        title: createAssessmentDto.title,
        description: createAssessmentDto.description,
        instruction: createAssessmentDto.instruction,
        is_active: createAssessmentDto.is_active ?? true,
        created_by: new Types.ObjectId(userId),
      };

      const assessment = await this.assessmentRepository.create(assessmentData);
      this.logger.log(`Assessment created with ID: ${assessment._id}`);

      // Step 2: Create modules and maintain a mapping for reference
      const moduleMapping = new Map<string, Types.ObjectId>();
      const createdModules: AssessmentModuleDocument[] = [];

      for (const moduleDto of createAssessmentDto.modules) {
        const moduleData = {
          assessment_id: assessment._id as Types.ObjectId,
          title: moduleDto.title,
          description: moduleDto.description,
          order: moduleDto.order,
        };

        const module = await this.assessmentModuleRepository.create(moduleData);
        moduleMapping.set(moduleDto.temp_id, module._id as Types.ObjectId);
        createdModules.push(module);

        this.logger.log(
          `Module created: ${moduleDto.temp_id} -> ${module._id}`,
        );
      }

      // Step 3: Create questions using the module mapping
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
          required_score: questionDto.required_score ?? 0,
          is_active: questionDto.is_active ?? true,
        };

        // Type-specific data handling
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

          case QuestionType.MULTIPLE_CHOICE:
          case QuestionType.CHECKBOX:
          case QuestionType.DROPDOWN: {
            {
              const optionsDto = questionDto as
                | CreateMultipleChoiceQuestionDto
                | CreateCheckboxQuestionDto
                | CreateDropdownQuestionDto;
              questionData = {
                ...baseQuestionData,
                options: optionsDto.options || [],
              };

              // Add checkbox-specific properties
              if (questionDto.type === QuestionType.CHECKBOX) {
                const checkboxDto = questionDto as CreateCheckboxQuestionDto;
                questionData.min_selections = checkboxDto.min_selections;
                questionData.max_selections = checkboxDto.max_selections;
              }

              // Add dropdown-specific properties
              if (questionDto.type === QuestionType.DROPDOWN) {
                const dropdownDto = questionDto as CreateDropdownQuestionDto;
                questionData.placeholder = dropdownDto.placeholder;
              }
              break;
            }
          }

          case QuestionType.SHORT_TEXT: {
            const shortTextDto = questionDto as CreateShortTextQuestionDto;
            questionData = {
              ...baseQuestionData,
              placeholder: shortTextDto.placeholder,
              max_length: shortTextDto.max_length,
              min_length: shortTextDto.min_length,
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
            };
            break;
          }

          case QuestionType.MULTIPLE_CHOICE_GRID: {
            const gridDto = questionDto as CreateMultipleChoiceGridQuestionDto;
            questionData = {
              ...baseQuestionData,
              grid_columns: gridDto.grid_columns || [],
              grid_rows: gridDto.grid_rows || [],
            };
            break;
          }

          default:
            // For any other question types, just use base data
            questionData = baseQuestionData;
            break;
        }

        const question = await this.questionRepository.create(questionData);
        createdQuestions.push(question);

        this.logger.log(`Question created for step ${questionDto.step}`);
      }

      return {
        success: true,
        message: 'Assessment with modules and questions created successfully',
        data: {
          assessment,
          modules: createdModules,
          questions: createdQuestions,
        },
      };
    } catch (error) {
      this.logger.error('Error creating assessment:', error);
      throw BadRequestException.BAD_REQUEST(
        'Failed to create assessment with modules and questions',
      );
    }
  }

  async getAssessments(userId?: string): Promise<any> {
    try {
      const filter = userId ? { created_by: new Types.ObjectId(userId) } : {};
      const assessments = await this.assessmentRepository.find(filter);

      return {
        success: true,
        message: 'Assessments retrieved successfully',
        data: assessments,
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

      // Cast the filter to any to avoid TypeScript issues with your BaseRepository
      const moduleFilter: any = {
        assessment_id: new Types.ObjectId(assessmentId),
      };

      const questionFilter: any = {
        assessment_id: new Types.ObjectId(assessmentId),
      };

      const modules = await this.assessmentModuleRepository.find(moduleFilter);
      const questions = await this.questionRepository.find(questionFilter);

      // Type assertion since we know the structure but TypeScript can't infer it
      const questionArray = (questions as any) || [];
      const moduleArray = (modules as any) || [];

      // Safely sort questions if they exist and have the sort method
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
        },
      };
    } catch (error) {
      this.logger.error('Error getting assessment:', error);
      throw BadRequestException.BAD_REQUEST('Failed to retrieve assessment');
    }
  }

  async getAvailableAssessments(): Promise<any> {
    try {
      // Cast the filter to any to avoid TypeScript issues
      const filter: any = {
        is_active: true,
      };

      const assessments = await this.assessmentRepository.find(filter);

      // Type assertion since we know the structure but TypeScript can't infer it
      const assessmentArray = (assessments as any) || [];

      // Safely map if assessments is an array
      const publicAssessments = Array.isArray(assessmentArray)
        ? assessmentArray.map((assessment: any) => ({
            _id: assessment._id,
            title: assessment.title,
            description: assessment.description,
            instruction: assessment.instruction,
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
  // Additional method to handle user assessments when you uncomment the DTO
  async getUserAssessments(userId: string): Promise<any> {
    try {
      // Cast the filter to any to avoid TypeScript issues with your BaseRepository
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
