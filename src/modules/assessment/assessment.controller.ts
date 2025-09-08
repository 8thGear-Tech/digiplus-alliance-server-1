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
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AssessmentService } from './assessment.service';
import {
  CreateAssessmentDto,
  CreateAssessmentResDto,
} from './dto/create-assessment.dto';
// import {
//   SubmitAssessmentDto,
//   SubmitAssessmentResDto,
// } from './dto/submit-assessment.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserTypes } from '../../shared/enums';
import { JwtUserAuthGuard } from '../auth/guards/jwt-user-auth.guard';

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
    summary:
      'Create complete assessment with modules and questions (Admin only)',
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
              welcome_message:
                'Welcome! This assessment will help us understand your current digital capabilities and provide personalized recommendations. It takes about 10-15 minutes to complete.',
              button_text: 'Begin Assessment',
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
                  value: 1,
                },
                {
                  id: 'opt-2',
                  text: 'Basic - Office applications and simple online tools',
                  value: 2,
                },
                {
                  id: 'opt-3',
                  text: 'Intermediate - Multiple digital tools for business',
                  value: 3,
                },
                {
                  id: 'opt-4',
                  text: 'Advanced - Integrated digital solutions',
                  value: 4,
                },
                {
                  id: 'opt-5',
                  text: 'Expert - Leading digital transformation',
                  value: 5,
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
                  value: 1,
                },
                {
                  id: 'opt-2',
                  text: 'Social media management (Hootsuite, Buffer)',
                  value: 1,
                },
                {
                  id: 'opt-3',
                  text: 'Customer relationship management (CRM)',
                  value: 1,
                },
                {
                  id: 'opt-4',
                  text: 'E-commerce platforms (Shopify, WooCommerce)',
                  value: 1,
                },
                {
                  id: 'opt-5',
                  text: 'Accounting software (QuickBooks, Xero)',
                  value: 1,
                },
                {
                  id: 'opt-6',
                  text: 'Project management tools (Trello, Asana)',
                  value: 1,
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
                { id: 'col-1', text: 'Not Digitized', value: 1 },
                { id: 'col-2', text: 'Basic Digital Tools', value: 2 },
                { id: 'col-3', text: 'Integrated Systems', value: 3 },
                { id: 'col-4', text: 'Advanced Analytics', value: 4 },
                { id: 'col-5', text: 'AI-Powered Optimization', value: 5 },
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
                { id: 'opt-1', text: 'Technology & Software', value: 1 },
                { id: 'opt-2', text: 'Healthcare & Medical', value: 2 },
                { id: 'opt-3', text: 'Education & Training', value: 3 },
                { id: 'opt-4', text: 'Finance & Banking', value: 4 },
                { id: 'opt-5', text: 'Manufacturing', value: 5 },
                { id: 'opt-6', text: 'Retail & E-commerce', value: 6 },
                { id: 'opt-7', text: 'Professional Services', value: 7 },
                { id: 'opt-8', text: 'Other', value: 8 },
              ],
              is_required: true,
              step: 1,
              module_ref: 'profile-module',
            },
          ],
        },
      },
      'Complete Assessment Example': {
        summary: 'Complete Assessment with Mixed Question Types',
        description: 'Full assessment example with all question types',
        value: {
          title: 'Comprehensive Digital Maturity Assessment',
          description:
            'Complete evaluation of your digital transformation readiness',
          instruction: 'Please answer all questions honestly and thoroughly',
          modules: [
            {
              temp_id: 'intro-module',
              title: 'Introduction',
              description: 'Welcome and overview',
              order: 1,
            },
            {
              temp_id: 'skills-module',
              title: 'Digital Skills',
              description: 'Current digital capabilities',
              order: 2,
            },
            {
              temp_id: 'tools-module',
              title: 'Current Tools',
              description: 'Existing digital infrastructure',
              order: 3,
            },
          ],
          questions: [
            {
              type: 'welcome_screen',
              question: 'Welcome',
              welcome_title: 'Digital Maturity Assessment',
              welcome_message:
                'This assessment will help evaluate your digital readiness and provide recommendations.',
              button_text: 'Start Assessment',
              step: 1,
              module_ref: 'intro-module',
            },
            {
              type: 'module_title',
              question: 'Skills Module Introduction',
              module_title: 'Digital Skills Assessment',
              module_description: 'Evaluate your current digital capabilities',
              step: 2,
              module_ref: 'skills-module',
            },
            {
              type: 'multiple_choice',
              question: 'What is your overall digital skill level?',
              options: [
                { id: 'opt-1', text: 'Beginner', value: 1 },
                { id: 'opt-2', text: 'Intermediate', value: 2 },
                { id: 'opt-3', text: 'Advanced', value: 3 },
              ],
              is_required: true,
              step: 3,
              module_ref: 'skills-module',
            },
            {
              type: 'checkbox',
              question: 'Which tools do you use?',
              options: [
                { id: 'opt-1', text: 'Microsoft Office', value: 1 },
                { id: 'opt-2', text: 'Google Workspace', value: 1 },
                { id: 'opt-3', text: 'CRM Software', value: 1 },
              ],
              min_selections: 1,
              step: 4,
              module_ref: 'tools-module',
            },
            {
              type: 'short_text',
              question: 'Business name?',
              placeholder: 'Enter business name',
              max_length: 100,
              step: 5,
              module_ref: 'tools-module',
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

  @Put('questions/:questionId')
  @UseGuards(RolesGuard)
  @Roles(UserTypes.admin)
  @ApiOperation({ summary: 'Update question (Admin only)' })
  @ApiResponse({ status: 200, description: 'Question updated successfully' })
  async updateQuestion(
    @Param('questionId') questionId: string,
    @Body() updateData: any,
  ): Promise<any> {
    return this.assessmentService.updateQuestion(questionId, updateData);
  }

  @Delete('questions/:questionId')
  @UseGuards(RolesGuard)
  @Roles(UserTypes.admin)
  @ApiOperation({ summary: 'Delete question (Admin only)' })
  @ApiResponse({ status: 200, description: 'Question deleted successfully' })
  async deleteQuestion(@Param('questionId') questionId: string): Promise<any> {
    return this.assessmentService.deleteQuestion(questionId);
  }

  // User Routes
  //   @Post('submit')
  //   @ApiOperation({ summary: 'Submit assessment answers' })
  //   @ApiResponse({
  //     status: 200,
  //     description: 'Assessment submitted successfully',
  //     type: SubmitAssessmentResDto,
  //   })
  //   async submitAssessment(
  //     @Body() submitAssessmentDto: SubmitAssessmentDto,
  //     @Request() req,
  //   ): Promise<SubmitAssessmentResDto> {
  //     return this.assessmentService.submitAssessment(
  //       submitAssessmentDto,
  //       req.user.user,
  //     );
  //   }

  //   @Get('user/submissions')
  //   @ApiOperation({ summary: 'Get current user assessment submissions' })
  //   @ApiResponse({
  //     status: 200,
  //     description: 'User assessments retrieved successfully',
  //   })
  //   async getUserAssessments(@Request() req): Promise<any> {
  //     return this.assessmentService.getUserAssessments(req.user.user);
  //   }
}
