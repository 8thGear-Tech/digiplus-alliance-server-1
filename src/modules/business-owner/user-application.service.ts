import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserSubmission } from './user-submission.schema';
import { SubmissionDto } from './submission.dto';
import { ApplicationForm } from '../admin/application/schemas/application-form.schema';
import { FormListItemDto } from './form-list-item.dto';
import { Service } from '../admin/services/schemas/service.schema';

// Define a type for the data returned by the query
type FormProjection = {
  _id: string;
  welcome_title: string;
  welcome_description?: string;
};

@Injectable()
export class UserApplicationService {
  constructor(
    @InjectModel(ApplicationForm.name)
    private applicationFormModel: Model<ApplicationForm>,
    @InjectModel(UserSubmission.name)
    private submissionModel: Model<UserSubmission>,
    @InjectModel(Service.name) // Add the Service model here
    private serviceModel: Model<Service>,
  ) {}

  async getLiveFormsList(): Promise<FormListItemDto[]> {
    const forms = await this.applicationFormModel
      .find({ isLive: true })
      .select('_id welcome_title welcome_description')
      .exec();

    return forms.map((form) => {
      const projectedForm = form.toObject() as FormProjection;
      return {
        id: projectedForm._id,
        welcome_title: projectedForm.welcome_title,
        welcome_description: projectedForm.welcome_description || '',
      };
    });
  }

  async getFormById(formId: string): Promise<ApplicationForm> {
    // Find the form by ID and ensure it is live
    const form = await this.applicationFormModel
      .findOne({
        _id: formId,
        isLive: true,
      })
      .exec();

    if (!form) {
      throw new NotFoundException('Application form not found or is not live.');
    }

    return form;
  }

  // async submitApplication(
  //   submissionDto: SubmissionDto,
  //   userId: string,
  // ): Promise<UserSubmission> {
  //   const { responses, service } = submissionDto;

  //   console.log('Attempting to save new submission with data:', {
  //     responses,
  //     service,
  //     userId,
  //   });

  //   // Find the service document to get its serviceType
  //   const selectedService = await this.serviceModel.findOne({ name: service });

  //   if (!selectedService) {
  //     throw new NotFoundException('Selected service not found.');
  //   }

  //   const newSubmission = new this.submissionModel({
  //     responses,
  //     service,
  //     userId: userId,
  //     serviceType: selectedService.serviceType,
  //   });

  //   try {
  //     const savedSubmission = await newSubmission.save();
  //     console.log('Submission saved successfully:', savedSubmission);
  //     return savedSubmission;
  //   } catch (error) {
  //     console.error('Failed to save submission:', error.message);
  //     throw error;
  //   }
  // }

  async submitApplication(
    slug: string,
    submissionDto: SubmissionDto,
    userId: string,
  ): Promise<UserSubmission> {
    const { responses, service } = submissionDto;

    const form = await this.applicationFormModel.findOne({
      slug,
      isLive: true,
    });
    if (!form) {
      throw new NotFoundException('Application form not found or is not live.');
    }

    const selectedService = await this.serviceModel.findOne({ name: service });
    if (!selectedService) {
      throw new NotFoundException('Selected service not found.');
    }

    // Perform validation on the submitted responses
    const formQuestions = new Map();
    form.questions.forEach((question) => {
      // Only process questions with a data_key to avoid the 'undefined' error
      if (question.data_key) {
        formQuestions.set(question.data_key, {
          isRequired: question.is_required,
          question: question.question,
        });
      }
    });

    const submittedResponsesKeys = new Set(Object.keys(responses));

    // A. Validate that all required questions have an answer
    form.questions.forEach((question) => {
      // Only check required questions that have a data_key
      if (
        question.is_required &&
        question.data_key &&
        !submittedResponsesKeys.has(question.data_key)
      ) {
        throw new BadRequestException(
          `The required question '${question.question}' (data_key: '${question.data_key}') was not provided in the submission.`,
        );
      }
    });

    // B. Validate that no extra/invalid fields were submitted
    submittedResponsesKeys.forEach((key) => {
      if (!formQuestions.has(key)) {
        throw new BadRequestException(
          `The submitted field '${key}' does not correspond to a question in the form.`,
        );
      }
    });

    // Create the new user submission
    const newSubmission = new this.submissionModel({
      responses,
      service,
      userId,
      serviceType: selectedService.serviceType,
      formId: form._id,
    });

    try {
      const savedSubmission = await newSubmission.save();
      return savedSubmission;
    } catch (error) {
      console.error('Failed to save submission:', error.message);
      throw error;
    }
  }

  async getUserSubmissions(userId: string): Promise<UserSubmission[]> {
    return this.submissionModel.find({ userId }).exec();
  }
}
