/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Get,
  Query,
  Patch,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtUserAuthGuard } from 'src/modules/auth/guards/jwt-user-auth.guard';
import { AdminApplicationService } from './services/admin-application.service';
import { UserSubmission } from 'src/modules/business-owner/user-submission.schema';
import {
  CreateApplicationFormDto,
  UpdateApplicationFormDto,
} from './dtos/create-application-form.dto';
import { ApplicationForm } from './schemas/application-form.schema';
import { GetApplicationsDto } from './dtos/get-applications.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ApplicationStatus, PaymentStatus, UserTypes } from 'src/shared/enums';
import { PublishFormDto } from './dtos/publish-form.dto';
import { QuestionDataKeyService } from './services/question-data-key.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateTrainingDetailsDto } from './dtos/update-training-details.dto';

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
          welcome_title: 'Application for DigiPlus Alliance Services',
          welcome_description: 'This application takes service request.',
          welcome_instruction:
            'Appication Instructions: Please fill out all required fields.',
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
              min_selections: 2,
              max_selections: 4,
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
              min_characters: 5,
              max_characters: 20,
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
              min_characters: 100,
              max_characters: 500,
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
              accepted_file_types: ['.pdf', '.docx'],
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

  @Get('submission-stats')
  @UseGuards(RolesGuard)
  @Roles(UserTypes.admin)
  @ApiOperation({
    summary:
      'Admin: Get application submission statistics by month for a specified year',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: 'Year to get stats for (defaults to current year)',
    example: 2025,
  })
  @ApiResponse({
    status: 200,
    description: 'Application submission statistics retrieved successfully.',
    schema: {
      example: {
        success: true,
        message: 'Application submission stats retrieved successfully',
        data: {
          year: 2025,
          summary: {
            total_applications: 256,
            months_with_submissions: 10,
            average_applications_per_month: 26,
          },
          monthly_breakdown: [
            {
              month: 'Jan',
              month_number: 1,
              year: 2025,
              total_applications: 25,
              application_details: [
                {
                  _id: '507f1f77bcf86cd799439011',
                  userId: '507f1f77bcf86cd799439012',
                  service_type: 'Business Registration',
                  status: 'pending',
                  payment_status: 'paid',
                  created_date: 'January 15, 2025',
                  created_time: '10:30 AM',
                },
              ],
            },
            // ... rest of months
          ],
          breakdown_by_status: [
            { status: 'pending', count: 120 },
            { status: 'approved', count: 80 },
            { status: 'rejected', count: 56 },
          ],
          breakdown_by_service_type: [
            { service_type: 'Business Registration', count: 150 },
            { service_type: 'Tax Compliance', count: 106 },
          ],
          breakdown_by_payment_status: [
            { payment_status: 'paid', count: 200 },
            { payment_status: 'pending', count: 56 },
          ],
          generated_at: '2025-10-15T14:30:00.000Z',
          generated_date: 'October 15, 2025',
          generated_time: '02:30:00 PM',
        },
      },
    },
  })
  async getApplicationSubmissionStats(
    @Query('year') year?: number,
  ): Promise<any> {
    return this.adminApplicationService.getApplicationSubmissionStats(year);
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
        service_type: 'Digital Skills & Training',
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

  @Get('trainings/participants')
  @UseGuards(RolesGuard)
  @Roles(UserTypes.admin)
  @ApiOperation({
    summary: 'Get a list of all approved and paid training participants.',
    description:
      'Returns a list of applications for "Digital Skills & Training" that have been approved and paid.',
  })
  @ApiQuery({
    name: 'trainingName',
    required: false,
    description: 'Optional filter by training name (e.g., "Web Development").',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of training participants retrieved successfully.',
    type: [UserSubmission],
    schema: {
      example: [
        {
          application_id: '68d69352c0549c0d9744a00d',
          name: 'John Doe',
          email: 'johndoe@example.com',
          service_type: 'Digital Skills & Training',
          service: 'MIRE Plus',
          status: 'Approved',
          submission_time: '9/26/2025, 2:21:22 PM',
          payment_status: 'Paid',
          payment_amount: 1500,
          timetable_url:
            'https://res.cloudinary.com/dklugyv9l/image/upload/v1759070458/training_timetables/dse_training-timetable-1759070449975.png',
          start_date: '10/15/2026, 1:00:00 AM',
          end_date: '10/30/2026, 1:00:00 AM',
        },
        {
          application_id: '68d9485e8efe11a409799ab1',
          name: 'John Doe',
          email: 'johndoe@example.com',
          service_type: 'Digital Skills & Training',
          service: 'DSE Training',
          status: 'Approved',
          submission_time: '9/28/2025, 3:38:22 PM',
          payment_status: 'Paid',
          payment_amount: 1500,
          timetable_url:
            'https://res.cloudinary.com/dklugyv9l/image/upload/v1759070458/training_timetables/dse_training-timetable-1759070449975.png',
          start_date: '10/15/2025, 1:00:00 AM',
          end_date: '10/30/2025, 1:00:00 AM',
        },
      ],
    },
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

  @Patch('trainings/details')
  @UseGuards(RolesGuard)
  @Roles(UserTypes.admin)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary:
      'Set start/end dates and/or upload timetable for all approved and paid participants of a specific training.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'Date details and optional timetable file/URL. If a file is uploaded, the generated URL takes precedence over the timetableUrl field.',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'Optional timetable file to upload. This field maps to @UploadedFile().',
        },

        timetable_url: {
          type: 'string',
          example: 'https://storage.link/timetable_mire_plus.pdf',
          description:
            'Optional direct link to the timetable (used if no file is uploaded).',
        },
        start_date: {
          type: 'string',
          format: 'date',
          example: '2025-10-15',
          description: 'The start date of the training.',
        },
        end_date: {
          type: 'string',
          format: 'date',
          example: '2025-10-30',
          description: 'The end date of the training.',
        },
      },
    },
  })
  @ApiQuery({
    name: 'trainingName',
    required: true,
    description:
      'The exact name of the training service to update (e.g., "MIRE Plus").',
    type: String,
  })
  async updateTrainingDetails(
    @Query('trainingName') trainingName: string,
    @Body() updateDto: UpdateTrainingDetailsDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!trainingName) {
      throw new BadRequestException(
        'A trainingName query parameter is required to identify the training service to update.',
      );
    }

    const hasTimetableUrl = !!updateDto.timetable_url;
    const hasDates = !!updateDto.start_date || !!updateDto.end_date;
    const hasFile = !!file;

    if (hasFile && hasTimetableUrl) {
      throw new BadRequestException(
        'You cannot submit both a file upload and a timetable URL. Please choose one.',
      );
    }

    if (!hasFile && !hasTimetableUrl && !hasDates) {
      throw new BadRequestException(
        'Must provide a file, a timetable URL, a start date, or an end date.',
      );
    }
    return this.adminApplicationService.updateTrainingDetails(
      trainingName,
      updateDto,
      file,
    );
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserTypes.admin)
  @ApiOperation({
    summary: 'Delete an application form',
    description:
      'Permanently deletes an application form. The form must be unpublished and have no associated submissions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Form deleted successfully.',
    schema: {
      example: {
        message: 'Application form deleted successfully.',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Form not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete live form or form with submissions.',
  })
  async deleteForm(@Param('id') id: string): Promise<{ message: string }> {
    return this.adminApplicationService.deleteForm(id);
  }
}
