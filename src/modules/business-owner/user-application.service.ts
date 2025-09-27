/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserSubmission } from './user-submission.schema';
import { SubmissionDto } from './submission.dto';
import { ApplicationForm } from '../admin/application/schemas/application-form.schema';
import { FormListItemDto } from './form-list-item.dto';
import { Service } from '../admin/services/schemas/service.schema';
import { ApplicationStatus } from 'src/shared/enums';
import { BaseRepository } from '../repository/base.repository';

type FormProjection = {
  _id: string;
  welcome_title: string;
  welcome_description?: string;
  slug?: string;
};

@Injectable()
export class UserApplicationService {
  constructor(
    @InjectModel(ApplicationForm.name)
    private applicationFormModel: Model<ApplicationForm>,
    @InjectModel(UserSubmission.name)
    private submissionModel: Model<UserSubmission>,
    @InjectModel(Service.name)
    private serviceModel: Model<Service>,
  ) {}

  private transformUserSubmissions(submissions: any[]): any[] {
    return submissions.map((submission) => {
      const firstName = submission.responses['first_name'] || 'N/A';
      const lastName = submission.responses['last_name'] || '';
      const name = `${firstName} ${lastName}`.trim();

      const submissionTime = new Date(submission.createdAt).toLocaleString();

      const startDate = submission.start_date
        ? new Date(submission.start_date).toLocaleString()
        : null;

      const endDate = submission.end_date
        ? new Date(submission.end_date).toLocaleString()
        : null;

      return {
        _id: submission._id,
        name,
        email: submission.responses['email'] || 'N/A',
        service: submission.service,
        service_type: submission.service_type,
        payment_amount: submission.payment_amount || null,
        status: submission.status,
        payment_status: submission.payment_status,
        submission_time: submissionTime,
        start_date: startDate,
        end_date: endDate,
        timetable_url: submission.timetable_url || null,
      };
    });
  }

  async getLiveFormsList(): Promise<FormListItemDto[]> {
    const forms = await this.applicationFormModel
      .find({ isLive: true })
      .select('slug welcome_title welcome_description')
      .exec();

    return forms.map((form) => {
      const projectedForm = form.toObject() as FormProjection;
      if (!projectedForm.slug) {
        throw new Error('Form is missing a required slug.');
      }
      return {
        id: projectedForm.slug,
        welcome_title: projectedForm.welcome_title,
        welcome_description: projectedForm.welcome_description || '',
      };
    });
  }

  async getFormBySlug(slug: string): Promise<ApplicationForm> {
    const form = await this.applicationFormModel
      .findOne({
        slug: slug,
        isLive: true,
      })
      .exec();

    if (!form) {
      throw new NotFoundException('Application form not found or is not live.');
    }

    return form;
  }

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

    const formQuestions = new Map();
    form.questions.forEach((question) => {
      if (question.data_key) {
        formQuestions.set(question.data_key, {
          isRequired: question.is_required,
          question: question.question,
        });
      }
    });

    const submittedResponsesKeys = new Set(Object.keys(responses));

    form.questions.forEach((question) => {
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

    submittedResponsesKeys.forEach((key) => {
      if (!formQuestions.has(key)) {
        throw new BadRequestException(
          `The submitted field '${key}' does not correspond to a question in the form.`,
        );
      }
    });

    const newSubmission = new this.submissionModel({
      responses,
      service,
      userId,
      service_type: selectedService.service_type,
      formId: form._id,
      payment_amount: selectedService.price,
    });

    try {
      const savedSubmission = await newSubmission.save();
      return savedSubmission;
    } catch (error) {
      console.error('Failed to save submission:', error.message);
      throw error;
    }
  }

  async getUserSubmissions(userId: string): Promise<any[]> {
    const submissions = await this.submissionModel
      .find({ userId })
      .select('+start_date +end_date +timetable_url +payment_amount')
      .exec();

    return this.transformUserSubmissions(submissions);
  }

  async getSubmissionStatusCounts(
    userId: string,
  ): Promise<Record<string, number>> {
    // 1. Define the Mongoose aggregation pipeline
    const pipeline = [
      // Stage 1: Filter by authenticated user's ID
      {
        $match: {
          userId: new Types.ObjectId(userId), // Assuming userId is stored as ObjectId
        },
      },
      // Stage 2: Group by status and count the results in each group
      {
        $group: {
          _id: '$status', // Group documents by the 'status' field
          count: { $sum: 1 }, // Count the documents in each group
        },
      },
    ];

    const results = await this.submissionModel.aggregate(pipeline).exec();

    // 3. Initialize the final map with all statuses set to 0
    const finalCounts: Record<string, number> = Object.values(
      ApplicationStatus,
    ).reduce(
      (acc, status) => {
        acc[status] = 0;
        return acc;
      },
      {} as Record<string, number>,
    );

    // 4. Merge aggregation results into the final map
    results.forEach((result) => {
      if (result._id && finalCounts.hasOwnProperty(result._id)) {
        finalCounts[result._id] = result.count;
      }
    });

    return finalCounts;
  }
}
