// // src/modules/user-application/user-application.service.ts

// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { UserSubmission } from './user-submission.schema';
// import { SubmissionDto } from './submission.dto';
// import { ApplicationForm } from '../admin/application/schemas/application-form.schema';
// import { FormListItemDto } from './form-list-item.dto';

// // Define a type for the data returned by the query
// type FormProjection = {
//   _id: string;
//   welcome_title: string;
//   welcome_description?: string;
// };

// @Injectable()
// export class UserApplicationService {
//   constructor(
//     @InjectModel(ApplicationForm.name)
//     private applicationFormModel: Model<ApplicationForm>,
//     @InjectModel(UserSubmission.name)
//     private submissionModel: Model<UserSubmission>,
//     //  @InjectModel(Service.name)
//     // private serviceModel: Model<Service>,
//   ) {}
//   async getLiveFormsList(): Promise<FormListItemDto[]> {
//     const forms = await this.applicationFormModel
//       .find({ isLive: true })
//       .select('_id welcome_title welcome_description')
//       .exec();

//     // Use a type assertion to tell TypeScript the shape of the data
//     return forms.map((form) => {
//       const projectedForm = form.toObject() as FormProjection;
//       return {
//         id: projectedForm._id,
//         welcome_title: projectedForm.welcome_title,
//         welcome_description: projectedForm.welcome_description || '',
//       };
//     });
//   }

//   async getFormById(formId: string): Promise<ApplicationForm> {
//     const form = await this.applicationFormModel.findById(formId).exec();

//     if (!form) {
//       throw new NotFoundException('Application form not found.');
//     }

//     return form;
//   }

//   //   async submitApplication(
//   //     submissionDto: SubmissionDto,
//   //     userId: string,
//   //   ): Promise<UserSubmission> {
//   //     const { responses, service } = submissionDto;

//   //     // // Find the service document to get its serviceType
//   //     // const selectedService = await this.serviceModel.findOne({ name: service });

//   //     // if (!selectedService) {
//   //     //   throw new NotFoundException('Service not found.');//
//   //     // }

//   //     const newSubmission = new this.submissionModel({
//   //       responses,
//   //       service,
//   //       userId: userId,
//   //       // serviceType: selectedService.serviceType, // Get serviceType from the found document
//   //     });

//   //     return newSubmission.save();
//   //   }

//   // src/modules/user-application/user-application.service.ts

//   // ... (imports)

//   async submitApplication(
//     submissionDto: SubmissionDto,
//     userId: string,
//   ): Promise<UserSubmission> {
//     const { responses, service } = submissionDto;

//     // Log the data being created to confirm it's correct
//     console.log('Attempting to save new submission with data:', {
//       responses,
//       service,
//       userId,
//     });

//     const newSubmission = new this.submissionModel({
//       responses,
//       service,
//       userId: userId,
//     });

//     try {
//       const savedSubmission = await newSubmission.save();
//       console.log('Submission saved successfully:', savedSubmission);
//       return savedSubmission;
//     } catch (error) {
//       console.error('Failed to save submission:', error.message);
//       throw error; // This will trigger your NestJS exception filters
//     }
//   }

//   // ... (rest of the file)
//   // New method to get a user's submissions
//   async getUserSubmissions(userId: string): Promise<UserSubmission[]> {
//     return this.submissionModel.find({ userId }).exec();
//   }
// }

// src/modules/user-application/user-application.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserSubmission } from './user-submission.schema';
import { SubmissionDto } from './submission.dto';
import { ApplicationForm } from '../admin/application/schemas/application-form.schema';
import { FormListItemDto } from './form-list-item.dto';

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

  async submitApplication(
    submissionDto: SubmissionDto,
    userId: string,
  ): Promise<UserSubmission> {
    const { responses, service } = submissionDto;

    console.log('Attempting to save new submission with data:', {
      responses,
      service,
      userId,
    });

    const newSubmission = new this.submissionModel({
      responses,
      service,
      userId: userId,
    });

    try {
      const savedSubmission = await newSubmission.save();
      console.log('Submission saved successfully:', savedSubmission);
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
