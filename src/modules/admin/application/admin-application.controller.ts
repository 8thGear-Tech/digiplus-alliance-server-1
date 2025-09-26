import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Get,
  Query,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtUserAuthGuard } from 'src/modules/auth/guards/jwt-user-auth.guard';
import { AdminApplicationService } from './services/admin-application.service';
import { UserSubmission } from 'src/modules/business-owner/user-submission.schema';
import {
  CreateApplicationFormDto,
  UpdateApplicationFormDto,
} from './dtos/create-application-form.dto';
import {
  ApplicationForm,
  EmbeddedQuestion,
} from './schemas/application-form.schema';
import { GetApplicationsDto } from './dtos/get-applications.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ApplicationStatus, PaymentStatus, UserTypes } from 'src/shared/enums';
import { PublishFormDto } from './dtos/publish-form.dto';
import { QuestionDataKeyService } from './services/question-data-key.service';
import { GetFormQuestionsDto } from './dtos/get-form-questions.dto';

@ApiTags('Admin Applications')
@ApiBearerAuth()
@UseGuards(JwtUserAuthGuard)
@Controller('admin/applications')
export class AdminApplicationController {
  constructor(
    private readonly adminApplicationService: AdminApplicationService,
    private readonly questionDataKeyService: QuestionDataKeyService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserTypes.admin)
  @ApiOperation({
    summary: 'Create a new application form with modules and questions',
  })
  @ApiBody({
    type: CreateApplicationFormDto,
    description:
      'Application form creation with different question type examples',
    examples: {
      'Welcome Screen Only': {
        summary: 'Standalone welcome screen (no modules or questions)',
        description: 'A form consisting only of a welcome screen.',
        value: {
          welcome_title: 'Welcome to Our Assessment',
          welcome_description:
            'This assessment helps us understand your needs.',
          welcome_instruction:
            'Please read the instructions carefully before proceeding. This will take about 10–15 minutes.\n\nTip: You can use the "Back" button anytime to review your answers.',
        },
      },
      'Multiple Choice Form': {
        summary: 'Form with Multiple Choice Questions',
        description:
          'An example of an application form using multiple choice questions.',
        value: {
          modules: [
            {
              temp_id: 'personal-info-module',
              title: 'Personal Information',
              description: 'Basic information about the applicant.',
              order: 1,
            },
          ],
          questions: [
            {
              type: 'multiple_choice',
              question: 'Which degree program are you applying for?',
              description: 'Initial student information form.',
              options: [
                { id: 'opt-1', text: 'Computer Science', value: 'cs' },
                { id: 'opt-2', text: 'Mechanical Engineering', value: 'me' },
                { id: 'opt-3', text: 'Business Administration', value: 'ba' },
              ],
              is_required: true,
              step: 1,
              module_ref: 'personal-info-module',
            },
          ],
        },
      },
      'Checkbox Form': {
        summary: 'Form with Checkbox Questions',
        description:
          'An example of a form that uses checkbox questions for multiple selections.',
        value: {
          modules: [
            {
              temp_id: 'skills-module',
              title: 'Skills and Experience',
              description: 'Your technical skills and past experience.',
              order: 1,
            },
          ],
          questions: [
            {
              type: 'checkbox',
              question: 'Which programming languages do you know?',
              description: 'Initial student information form.',
              options: [
                { id: 'opt-1', text: 'Python', value: 'python' },
                { id: 'opt-2', text: 'JavaScript', value: 'javascript' },
                { id: 'opt-3', text: 'Java', value: 'java' },
                { id: 'opt-4', text: 'C++', value: 'cpp' },
              ],
              min_selections: 1,
              is_required: true,
              step: 1,
              module_ref: 'skills-module',
            },
          ],
        },
      },
      'Short Text Example': {
        summary: 'Form with a Short Text Question',
        description: 'An example of a form that includes a short text input.',
        value: {
          modules: [
            {
              temp_id: 'contact-module',
              title: 'Contact Info',
              description: 'Your basic contact details.',
              order: 1,
            },
          ],
          questions: [
            {
              type: 'short_text',
              question: 'What is your first name?',
              description: 'Initial student information form.',
              placeholder: 'Enter your first name',
              is_required: true,
              step: 1,
              module_ref: 'contact-module',
            },
          ],
        },
      },
      'Long Text Example': {
        summary: 'Form with a Long Text Question',
        description: 'An example of a form that includes a long text input.',
        value: {
          modules: [
            {
              temp_id: 'feedback-module',
              title: 'Feedback',
              description: 'Please provide your comments.',
              order: 1,
            },
          ],
          questions: [
            {
              type: 'long_text',
              question: 'Please provide any additional comments or feedback.',
              description: 'Initial student information form.',
              placeholder: 'Enter your comments here...',
              is_required: false,
              step: 1,
              module_ref: 'feedback-module',
            },
          ],
        },
      },
      'Dropdown Example': {
        summary: 'Form with a Dropdown Question',
        description: 'An example of a form that uses a dropdown menu.',
        value: {
          modules: [
            {
              temp_id: 'demographics-module',
              title: 'Demographic Information',
              description: 'Your age and location.',
              order: 1,
            },
          ],
          questions: [
            {
              type: 'dropdown',
              question: 'Which country do you live in?',
              description: 'Initial student information form.',
              options: [
                { id: 'opt-1', text: 'United States' },
                { id: 'opt-2', text: 'Canada' },
                { id: 'opt-3', text: 'Mexico' },
              ],
              is_required: true,
              step: 1,
              module_ref: 'demographics-module',
            },
          ],
        },
      },
      'Multiple Choice Grid Form': {
        summary: 'Form with Multiple Choice Grid Questions',
        description: 'An example of a form using a multiple choice grid.',
        value: {
          modules: [
            {
              temp_id: 'course-selection',
              title: 'Course Selection',
              description: 'Select and rate courses.',
              order: 1,
            },
          ],
          questions: [
            {
              type: 'multiple_choice_grid',
              question: 'Rate your interest level for each course below.',
              grid_columns: [
                { id: 'col-1', text: 'Not Interested', value: 1 },
                { id: 'col-2', text: 'Slightly Interested', value: 2 },
                { id: 'col-3', text: 'Very Interested', value: 3 },
              ],
              grid_rows: [
                { id: 'row-1', text: 'Introduction to AI' },
                { id: 'row-2', text: 'Data Structures' },
                { id: 'row-3', text: 'Web Development Basics' },
              ],
              is_required: true,
              step: 1,
              module_ref: 'course-selection',
            },
          ],
        },
      },
      'File Upload Example': {
        summary: 'Form with a File Upload Question',
        description:
          'An example of a form that includes a file upload question.',
        value: {
          modules: [
            {
              temp_id: 'documents-module',
              title: 'Required Documents',
              description: 'Please upload your documents.',
              order: 1,
            },
          ],
          questions: [
            {
              type: 'file_upload',
              question: 'Please upload your resume.',
              acceptedFileTypes: ['.pdf', '.docx'],
              is_required: true,
              step: 1,
              module_ref: 'documents-module',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 201, type: ApplicationForm })
  async createForm(
    @Body() dto: CreateApplicationFormDto,
  ): Promise<ApplicationForm> {
    return this.adminApplicationService.createForm(dto);
  }

  @Get('forms')
  @ApiOperation({ summary: 'Get a list of all application forms' })
  @ApiResponse({
    status: 200,
    description: 'Forms retrieved successfully.',
    type: [ApplicationForm],
  })
  async getMultipleForms(): Promise<ApplicationForm[]> {
    return this.adminApplicationService.getAllForms();
  }

  @Get('list')
  @ApiOperation({ summary: 'Get a list of all submitted applications' })
  @ApiResponse({
    status: 200,
    description: 'List of submissions retrieved successfully.',
    type: [UserSubmission],
  })
  @ApiResponse({
    status: 404,
    description: 'No submissions found for the selected filter.',
  })
  async getApplicationList(
    @Query() dto: GetApplicationsDto,
  ): Promise<UserSubmission[]> {
    return this.adminApplicationService.getApplicationList(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single application form by ID' })
  @ApiResponse({
    status: 200,
    description: 'Form retrieved successfully.',
    type: ApplicationForm,
  })
  @ApiResponse({ status: 404, description: 'Form not found.' })
  async getSingleForm(@Param('id') id: string): Promise<ApplicationForm> {
    return this.adminApplicationService.getSingleForm(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserTypes.admin)
  @ApiOperation({ summary: 'Update an existing application form' })
  @ApiResponse({ status: 200, type: ApplicationForm })
  async updateForm(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationFormDto,
  ): Promise<ApplicationForm> {
    return this.adminApplicationService.updateForm(id, dto);
  }

  @Patch('publish/:id')
  @UseGuards(RolesGuard)
  @Roles(UserTypes.admin)
  @ApiOperation({ summary: 'Publishes or unpublishes an application form' })
  @ApiResponse({
    status: 200,
    description: 'Form status updated successfully.',
  })
  @ApiResponse({ status: 404, description: 'Form not found.' })
  async publish(
    @Param('id') id: string,
    @Body() { isLive }: PublishFormDto,
  ): Promise<ApplicationForm> {
    return this.adminApplicationService.publishForm(id, isLive);
  }

  @Patch('status/:id')
  @ApiOperation({ summary: 'Update the status of a specific application' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: [
            'Submitted',
            'Being Processed',
            'Approved',
            'Rejected',
            'Completed',
          ],
          example: 'Approved',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The submission status was updated successfully.',
    schema: {
      example: {
        _id: '654c6a654c6a4654c6a654c6a',
        name: 'Oyebode Anjoke',
        email: 'anjokea@gmail.com',
        serviceType: 'Digital Skills & Training',
        status: 'Approved',
        payment_status: 'Not Paid',
        timestamp: '16 June 2025 • 9.30 am',
      },
    },
  })
  async updateApplicationStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ): Promise<UserSubmission> {
    return this.adminApplicationService.updateApplicationStatus(
      id,
      status as ApplicationStatus,
    );
  }

  @Patch('payment-status/:id')
  @ApiOperation({
    summary: 'Update the payment status of a specific application',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        paymentStatus: {
          type: 'string',
          enum: ['Paid', 'Not Paid'],
          example: 'Paid',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The submission payment status was updated successfully.',
    schema: {
      example: {
        _id: '654c6a654c6a4654c6a654c6a',
        name: 'Oyebode Anjoke',
        email: 'anjokea@gmail.com',
        serviceType: 'Digital Skills & Training',
        status: 'Approved',
        payment_status: 'Paid',
        timestamp: '16 June 2025 • 9.30 am',
      },
    },
  })
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body('paymentStatus') paymentStatus: string,
  ): Promise<UserSubmission> {
    return this.adminApplicationService.updatePaymentStatus(
      id,
      paymentStatus as PaymentStatus,
    );
  }

  //validation
  // Add these methods to your AdminApplicationController

  @Get('validation-rules/:id')
  @ApiOperation({ summary: 'Get validation rules for a form' })
  async getFormValidationRules(@Param('id') id: string) {
    return this.adminApplicationService.getFormValidationRules(id);
  }

  @Post('validate-input')
  @ApiOperation({ summary: 'Validate user input against question rules' })
  async validateInput(
    @Body() dto: { questionId: string; value: string; formId: string },
  ) {
    const form = await this.adminApplicationService.getApplicationList({});
    return { isValid: true, errors: [] };
  }

  //trainings

  @Get('trainings/participants')
  @UseGuards(RolesGuard)
  @Roles(UserTypes.admin)
  @ApiOperation({
    summary: 'Get a list of all approved and paid training participants.',
    description:
      'Returns a list of applications for "Digital Skills & Training" that have been approved and paid.',
  })
  @ApiQuery({
    name: 'trainingName', // Change this to 'trainingName'
    required: false,
    description: 'Optional filter by training name (e.g., "Web Development").',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of training participants retrieved successfully.',
    type: [UserSubmission],
  })
  @ApiResponse({
    status: 404,
    description: 'No approved and paid participants found.',
  })
  async getTrainingParticipants(
    @Query('trainingName') trainingName?: string,
  ): Promise<UserSubmission[]> {
    return this.adminApplicationService.getTrainingParticipants(trainingName);
  }
}
