// // src/modules/user-application/user-application.service.ts

// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { Submission } from './submission.schema';
// import { SubmissionDto } from './submission.dto';
// import { ApplicationForm } from '../admin/application/schemas/application-form.schema';

// @Injectable()
// export class UserApplicationService {
//   constructor(
//     @InjectModel(ApplicationForm.name)
//     private applicationFormModel: Model<ApplicationForm>,
//     @InjectModel(Submission.name)
//     private submissionModel: Model<Submission>,
//   ) {}

//   async getLiveForm(): Promise<ApplicationForm> {
//     const liveForm = await this.applicationFormModel
//       .findOne({
//         isLive: true,
//       })
//       .exec();

//     if (!liveForm) {
//       throw new NotFoundException('No active application form found.');
//     }

//     return liveForm;
//   }

//   async submitApplication(submissionDto: SubmissionDto): Promise<Submission> {
//     const { serviceType, service, responses } = submissionDto;

//     const newSubmission = new this.submissionModel({
//       serviceType: serviceType,
//       service: service,
//       responses: responses,
//     });

//     return newSubmission.save();
//   }
// }
