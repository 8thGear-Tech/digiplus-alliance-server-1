/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  //   Put,
  //   Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Put,
  Patch,
  // Put,
  // Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { AssessmentService } from './assessment.service';
import {
  CreateAssessmentDto,
  CreateAssessmentResDto,
} from './dto/create-assessment.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserTypes } from '../../shared/enums';
import { JwtUserAuthGuard } from '../auth/guards/jwt-user-auth.guard';
import {
  UpdateAssessmentDto,
  UpdateAssessmentResDto,
} from './dto/update-assessment.dto';
import {
  SubmitAssessmentDto,
  SubmitAssessmentResDto,
} from './dto/submit-assessment.dto';

@ApiTags('Assessments')
@Controller('api/assessments')
@UseGuards(JwtUserAuthGuard)
@ApiBearerAuth()
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  // Admin Routes
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserTypes.admin)
  @ApiOperation({
    summary: 'Create Assessment with Questions',
    description:
      'Create a comprehensive assessment with modules and questions of different types. Each question type has specific requirements and properties.',
  })
  @ApiBody({
    type: CreateAssessmentDto,
    description: 'Assessment creation with different question type examples',
    examples: {
      'Welcome Screen Only': {
        summary: 'Assessment with Welcome Screen',
        description: 'Simple assessment starting with a welcome screen',
        value: {
          title: 'Digital Readiness Assessment',
          description: 'Evaluate your digital transformation readiness',
          instruction: 'Please complete all sections honestly',
          modules: [
            {
              temp_id: 'intro-module',
              title: 'Introduction',
              description: 'Welcome and overview',
              order: 1,
            },
          ],
          questions: [
            {
              type: 'welcome_screen',
              question: 'Assessment Welcome',
              welcome_title: 'Digital Readiness Assessment',
              welcome_description:
                'Welcome! This assessment will help us understand your current digital capabilities and provide personalized recommendations. It takes about 10-15 minutes to complete.',
              welcome_instruction:
                'Click the button below to begin your digital transformation assessment journey.',
              step: 1,
              module_ref: 'intro-module',
              is_active: true,
            },
          ],
          is_active: true,
        },
      },
      'Multiple Choice Assessment': {
        summary: 'Assessment with Multiple Choice Questions',
        description: 'Assessment focusing on multiple choice questions',
        value: {
          title: 'Digital Skills Evaluation',
          description: 'Assess your digital skill levels',
          modules: [
            {
              temp_id: 'skills-module',
              title: 'Digital Skills',
              description: 'Evaluate current digital capabilities',
              order: 1,
            },
          ],
          questions: [
            {
              type: 'module_title',
              question: 'Module Introduction',
              module_title: 'Digital Skills Assessment',
              module_description:
                'In this section, we will evaluate your familiarity with digital tools and technologies.',
              step: 1,
              module_ref: 'skills-module',
            },
            {
              type: 'multiple_choice',
              question:
                'What best describes your current level of digital tool usage?',
              description:
                'Select the option that most accurately reflects your situation',
              instruction: 'Choose only one option',
              options: [
                {
                  id: 'opt-1',
                  text: 'Minimal - Basic email and web browsing',
                  points: 1,
                },
                {
                  id: 'opt-2',
                  text: 'Basic - Office applications and simple online tools',
                  points: 2,
                },
                {
                  id: 'opt-3',
                  text: 'Intermediate - Multiple digital tools for business',
                  points: 3,
                },
                {
                  id: 'opt-4',
                  text: 'Advanced - Integrated digital solutions',
                  points: 4,
                },
                {
                  id: 'opt-5',
                  text: 'Expert - Leading digital transformation',
                  points: 5,
                },
              ],
              is_required: true,
              step: 2,
              module_ref: 'skills-module',
            },
          ],
        },
      },
      'Checkbox Assessment': {
        summary: 'Assessment with Checkbox Questions',
        description:
          'Assessment using checkbox questions for multiple selections',
        value: {
          title: 'Current Tools Assessment',
          modules: [
            {
              temp_id: 'tools-module',
              title: 'Current Digital Tools',
              order: 1,
            },
          ],
          questions: [
            {
              type: 'checkbox',
              question:
                'Which digital tools do you currently use in your business?',
              description: 'Select all tools that you actively use',
              instruction: 'You can select multiple options',
              options: [
                {
                  id: 'opt-1',
                  text: 'Email marketing tools (Mailchimp, Constant Contact)',
                  points: 1,
                },
                {
                  id: 'opt-2',
                  text: 'Social media management (Hootsuite, Buffer)',
                  points: 1,
                },
                {
                  id: 'opt-3',
                  text: 'Customer relationship management (CRM)',
                  points: 1,
                },
                {
                  id: 'opt-4',
                  text: 'E-commerce platforms (Shopify, WooCommerce)',
                  points: 1,
                },
                {
                  id: 'opt-5',
                  text: 'Accounting software (QuickBooks, Xero)',
                  points: 1,
                },
                {
                  id: 'opt-6',
                  text: 'Project management tools (Trello, Asana)',
                  points: 1,
                },
              ],
              min_selections: 1,
              max_selections: 6,
              is_required: true,
              step: 1,
              module_ref: 'tools-module',
            },
          ],
        },
      },
      'Text Input Assessment': {
        summary: 'Assessment with Text Questions',
        description: 'Assessment using short and long text input questions',
        value: {
          title: 'Business Information Assessment',
          modules: [
            {
              temp_id: 'business-module',
              title: 'Business Information',
              order: 1,
            },
          ],
          questions: [
            {
              type: 'short_text',
              question: 'What is the name of your business?',
              description: 'Please enter your business or organization name',
              placeholder: 'e.g., ABC Marketing Solutions',
              max_length: 100,
              min_length: 2,
              is_required: true,
              step: 1,
              module_ref: 'business-module',
            },
            {
              type: 'long_text',
              question:
                'Describe your biggest challenges with digital transformation',
              description:
                'Please provide specific examples from your experience',
              instruction:
                'Write at least 3-4 sentences with specific examples',
              placeholder:
                'e.g., Our team struggles with adopting new software because of limited training time...',
              max_length: 1000,
              min_length: 50,
              rows: 5,
              is_required: true,
              step: 2,
              module_ref: 'business-module',
            },
          ],
        },
      },
      'Grid Assessment': {
        summary: 'Assessment with Grid Questions',
        description: 'Assessment using multiple choice grid questions',
        value: {
          title: 'Digital Maturity Grid Assessment',
          modules: [
            {
              temp_id: 'maturity-module',
              title: 'Digital Maturity Evaluation',
              order: 1,
            },
          ],
          questions: [
            {
              type: 'multiple_choice_grid',
              question:
                'For each business area below, how would you rate your current digital maturity?',
              description:
                'Rate each area based on your current digital adoption and effectiveness',
              instruction: 'Select one option for each row',
              grid_columns: [
                { id: 'col-1', text: 'Not Digitized', points: 1 },
                { id: 'col-2', text: 'Basic Digital Tools', points: 2 },
                { id: 'col-3', text: 'Integrated Systems', points: 3 },
                { id: 'col-4', text: 'Advanced Analytics', points: 4 },
                { id: 'col-5', text: 'AI-Powered Optimization', points: 5 },
              ],
              grid_rows: [
                { id: 'row-1', text: 'Customer relationship management' },
                { id: 'row-2', text: 'Sales and marketing processes' },
                { id: 'row-3', text: 'Financial management and reporting' },
                { id: 'row-4', text: 'Inventory and supply chain management' },
              ],
              is_required: true,
              step: 1,
              module_ref: 'maturity-module',
            },
          ],
        },
      },
      'Dropdown Assessment': {
        summary: 'Assessment with Dropdown Questions',
        description: 'Assessment using dropdown selection questions',
        value: {
          title: 'Business Profile Assessment',
          modules: [
            {
              temp_id: 'profile-module',
              title: 'Business Profile',
              order: 1,
            },
          ],
          questions: [
            {
              type: 'dropdown',
              question:
                'What industry does your business primarily operate in?',
              description:
                'Select the industry that best matches your business',
              placeholder: 'Select your industry',
              options: [
                { id: 'opt-1', text: 'Technology & Software', points: 1 },
                { id: 'opt-2', text: 'Healthcare & Medical', points: 2 },
                { id: 'opt-3', text: 'Education & Training', points: 3 },
                { id: 'opt-4', text: 'Finance & Banking', points: 4 },
                { id: 'opt-5', text: 'Manufacturing', points: 5 },
                { id: 'opt-6', text: 'Retail & E-commerce', points: 6 },
                { id: 'opt-7', text: 'Professional Services', points: 7 },
                { id: 'opt-8', text: 'Other', points: 8 },
              ],
              is_required: true,
              step: 1,
              module_ref: 'profile-module',
            },
          ],
        },
      },
      'Complete Points-Based Assessment': {
        summary: 'Complete Assessment with Service Recommendations',
        description:
          'Full example showing point-based scoring for service recommendations',
        value: {
          title: 'Digital Maturity Assessment with Service Recommendations',
          description:
            'Comprehensive evaluation with personalized service suggestions',
          instruction:
            'Answer all questions to receive personalized service recommendations',
          modules: [
            {
              temp_id: 'skills-module',
              title: 'Digital Skills Assessment',
              description: 'Evaluate current capabilities',
              order: 1,
              max_points: 25,
            },
            {
              temp_id: 'tools-module',
              title: 'Current Tools Usage',
              description: 'Assess existing digital infrastructure',
              order: 2,
              max_points: 30,
            },
          ],
          questions: [
            {
              type: 'welcome_screen',
              question: 'Welcome',
              welcome_title: 'Digital Maturity Assessment',
              welcome_description:
                'This assessment will recommend the best services for your digital transformation journey.',
              welcome_instruction: 'Begin your personalized assessment now.',
              step: 1,
              module_ref: 'skills-module',
            },
            {
              type: 'multiple_choice',
              question: 'What is your current digital skill level?',
              options: [
                {
                  id: 'skill-1',
                  text: 'Beginner - Learning basics',
                  points: 2,
                  points_description: 'Needs comprehensive support',
                },
                {
                  id: 'skill-2',
                  text: 'Intermediate - Comfortable with tools',
                  points: 5,
                  points_description: 'Ready for moderate solutions',
                },
                {
                  id: 'skill-3',
                  text: 'Advanced - Leading digital initiatives',
                  points: 8,
                  points_description: 'Suitable for complex implementations',
                },
              ],
              max_points: 8,
              scoring_categories: ['digital_literacy', 'leadership_readiness'],
              step: 2,
              module_ref: 'skills-module',
            },
            {
              type: 'checkbox',
              question: 'Which tools do you currently use?',
              options: [
                {
                  id: 'tool-1',
                  text: 'Basic Office Tools',
                  points: 2,
                  points_description: 'Foundation tools',
                },
                {
                  id: 'tool-2',
                  text: 'CRM Systems',
                  points: 4,
                  points_description: 'Customer management',
                },
                {
                  id: 'tool-3',
                  text: 'Advanced Analytics',
                  points: 6,
                  points_description: 'Data-driven insights',
                },
              ],
              scoring_method: 'sum',
              max_points: 12,
              scoring_categories: ['tool_adoption', 'data_maturity'],
              step: 3,
              module_ref: 'tools-module',
            },
            {
              type: 'multiple_choice_grid',
              question: 'Rate your digital maturity in each area',
              grid_columns: [
                {
                  id: 'maturity-1',
                  text: 'Basic',
                  points: 1,
                  points_description: 'Getting started',
                },
                {
                  id: 'maturity-2',
                  text: 'Intermediate',
                  points: 3,
                  points_description: 'Making progress',
                },
                {
                  id: 'maturity-3',
                  text: 'Advanced',
                  points: 5,
                  points_description: 'Leading edge',
                },
              ],
              grid_rows: [
                {
                  id: 'area-1',
                  text: 'Customer Management',
                  weight: 1.5,
                },
                {
                  id: 'area-2',
                  text: 'Data Analytics',
                  weight: 1.2,
                },
              ],
              max_points: 15,
              scoring_categories: ['process_maturity', 'analytics_readiness'],
              step: 4,
              module_ref: 'tools-module',
            },
          ],
          service_recommendations: [
            {
              service_id: 'basic_package',
              service_name: 'Digital Foundation Package',
              description: 'Essential tools and training for digital beginners',
              min_points: 0,
              max_points: 15,
              levels: ['Beginner', 'Foundational'],
            },
            {
              service_id: 'intermediate_package',
              service_name: 'Digital Growth Package',
              description: 'Integrated solutions for growing businesses',
              min_points: 16,
              max_points: 30,
              levels: ['Beginner', 'Foundational'],
            },
            {
              service_id: 'advanced_package',
              service_name: 'Digital Leadership Package',
              description: 'Advanced analytics and AI-powered solutions',
              min_points: 31,
              max_points: 50,
              levels: ['Beginner', 'Foundational'],
            },
          ],
          is_active: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Assessment created successfully',
    type: CreateAssessmentResDto,
  })
  async createAssessment(
    @Body() createAssessmentDto: CreateAssessmentDto,
    @Request() req,
  ): Promise<CreateAssessmentResDto> {
    return this.assessmentService.createAssessment(
      createAssessmentDto,
      req.user.user,
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserTypes.admin)
  @ApiOperation({ summary: 'Get all assessments (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Assessments retrieved successfully',
  })
  async getAssessments(@Request() req): Promise<any> {
    return this.assessmentService.getAssessments(req.user.user as string);
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available assessments for users' })
  @ApiResponse({
    status: 200,
    description: 'Available assessments retrieved successfully',
  })
  async getAvailableAssessments(): Promise<any> {
    return this.assessmentService.getAvailableAssessments();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assessment by ID with modules and questions' })
  @ApiResponse({
    status: 200,
    description: 'Assessment retrieved successfully',
  })
  async getAssessmentById(@Param('id') id: string): Promise<any> {
    return this.assessmentService.getAssessmentById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserTypes.admin)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update an assessment (Admin only)',
    description:
      'Update an existing assessment with its modules, questions, and service recommendations. Only admins can update assessments.',
  })
  @ApiParam({
    name: 'id',
    description: 'Assessment ID',
    type: 'string',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: UpdateAssessmentDto,
    description: 'Assessment update data',
    examples: {
      basicUpdate: {
        summary: 'Basic assessment update',
        value: {
          title: 'Updated Digital Maturity Assessment',
          description: 'Updated description for better clarity',
          is_active: true,
        },
      },
      addNewQuestion: {
        summary: 'Add new question to assessment',
        value: {
          questions: [
            {
              type: 'multiple_choice',
              question: 'How would you rate your AI adoption?',
              step: 15,
              module_ref: 'module-1',
              options: [
                { id: 'ai-1', text: 'No AI tools', points: 1 },
                { id: 'ai-2', text: 'Basic AI tools', points: 3 },
                { id: 'ai-3', text: 'Advanced AI', points: 5 },
              ],
            },
          ],
        },
      },
      updateExistingQuestion: {
        summary: 'Update existing question',
        value: {
          questions: [
            {
              id: '507f1f77bcf86cd799439013',
              question: 'Updated: What is your digital skill level?',
              options: [
                { id: 'opt-1', text: 'Beginner', points: 2 },
                { id: 'opt-2', text: 'Intermediate', points: 5 },
                { id: 'opt-3', text: 'Advanced', points: 8 },
                { id: 'opt-4', text: 'Expert', points: 10 },
              ],
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Assessment updated successfully',
    type: UpdateAssessmentResDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid data provided',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only update own assessments',
  })
  @ApiResponse({
    status: 404,
    description: 'Assessment not found',
  })
  async updateAssessment(
    @Param('id') assessmentId: string,
    @Body() updateAssessmentDto: UpdateAssessmentDto,
  ): Promise<UpdateAssessmentResDto> {
    return await this.assessmentService.updateAssessment(
      assessmentId,
      updateAssessmentDto,
    );
  }

  // @Put('questions/:questionId')
  // @UseGuards(RolesGuard)
  // @Roles(UserTypes.admin)
  // @ApiOperation({ summary: 'Update question (Admin only)' })
  // @ApiResponse({ status: 200, description: 'Question updated successfully' })
  // async updateQuestion(
  //   @Param('questionId') questionId: string,
  //   @Body() updateData: any,
  // ): Promise<any> {
  //   return this.assessmentService.updateQuestion(questionId, updateData);
  // }

  // @Delete('questions/:questionId')
  // @UseGuards(RolesGuard)
  // @Roles(UserTypes.admin)
  // @ApiOperation({ summary: 'Delete question (Admin only)' })
  // @ApiResponse({ status: 200, description: 'Question deleted successfully' })
  // async deleteQuestion(@Param('questionId') questionId: string): Promise<any> {
  //   return this.assessmentService.deleteQuestion(questionId);
  // }

  // User Routes
  // @Post('submit')
  // @ApiOperation({ summary: 'Submit assessment answers' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Assessment submitted successfully',
  //   type: SubmitAssessmentResDto,
  // })
  // async submitAssessment(
  //   @Body() submitAssessmentDto: SubmitAssessmentDto,
  //   @Request() req,
  // ): Promise<SubmitAssessmentResDto> {
  //   return this.assessmentService.submitAssessment(
  //     submitAssessmentDto,
  //     req.user.user,
  //   );
  // }

  //added by opeyemi
  // IN THE CONTROLLER
  @Post('submit')
  @ApiOperation({ summary: 'Submit assessment answers' })
  @ApiResponse({
    status: 200,
    description: 'Assessment submitted successfully',
    type: SubmitAssessmentResDto,
  })
  async submitAssessment(
    @Body() submitAssessmentDto: SubmitAssessmentDto,
    @Request() req, // Assumes req.user.user contains the authenticated user's ID string
  ): Promise<SubmitAssessmentResDto> {
    const { assessment_id, responses, user_id } = submitAssessmentDto; // Destructure the DTO

    // Use the authenticated user's ID as the final argument,
    // falling back to the DTO's user_id if needed, or null/undefined if not present.
    const finalUserId = req.user?.user || user_id;

    // ✅ CORRECT CALL: Pass the arguments in the order the Service expects them.
    return this.assessmentService.submitAssessment(
      assessment_id, // Argument 1: string
      responses, // Argument 2: Record<string, any> (object)
      finalUserId, // Argument 3: string | undefined
    );
  }

  @Get('user/submissions')
  @ApiOperation({ summary: 'Get current user assessment submissions' })
  @ApiResponse({
    status: 200,
    description: 'User assessments retrieved successfully',
  })
  async getUserAssessments(@Request() req): Promise<any> {
    return this.assessmentService.getUserAssessments(req.user.user);
  }
}
