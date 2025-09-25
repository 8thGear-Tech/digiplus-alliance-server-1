// // src/modules/user-application/user-application.controller.ts

// import { Controller, Post, Body, Get } from '@nestjs/common';
// import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
// import { UserApplicationService } from './user-application.service';
// import { SubmissionDto } from './submission.dto';
// import { Submission } from './submission.schema';
// import { ApplicationForm } from '../admin/application/schemas/application-form.schema';

// @ApiTags('User Applications')
// @Controller('user/applications')
// export class UserApplicationController {
//   constructor(
//     private readonly userApplicationService: UserApplicationService,
//   ) {}

//   @Post('submit')
//   @ApiOperation({ summary: 'Submit a new application form' })
//   @ApiResponse({
//     status: 201,
//     description: 'Application submitted successfully.',
//     type: Submission,
//   })
//   async submitApplication(
//     @Body() submissionDto: SubmissionDto,
//   ): Promise<Submission> {
//     return this.userApplicationService.submitApplication(submissionDto);
//   }

//   @Get('questions')
//   @ApiOperation({ summary: 'Get the active application form questions' })
//   @ApiResponse({
//     status: 200,
//     description: 'Questions retrieved successfully.',
//     type: ApplicationForm,
//   })
//   @ApiResponse({
//     status: 404,
//     description: 'No active application form found.',
//   })
//   async getFormQuestions(): Promise<ApplicationForm> {
//     return this.userApplicationService.getLiveForm();
//   }
// }
