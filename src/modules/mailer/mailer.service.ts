// import { Injectable } from '@nestjs/common';
// import { createTransport } from 'nodemailer';
// import * as Mail from 'nodemailer/lib/mailer';
// import { ConfigService } from '@nestjs/config';
// import * as brevo from '@getbrevo/brevo';
// import {
//   TransactionalEmailsApi,
//   SendSmtpEmail,
//   Configuration,
// } from '@getbrevo/brevo';

// @Injectable()
// export class MailerService {
//   private nodemailerTransport: Mail;
//   private brevoApiInstance: TransactionalEmailsApi;

//   constructor(private readonly configService: ConfigService) {
//     const dev_env =
//       process.env.NODE_ENV === 'production' ? 'production' : 'development';

//     this.nodemailerTransport = createTransport({
//       host: configService.get<string>(`${dev_env}.mail.BREVO_HOST`),
//       port: configService.get<number>(`${dev_env}.mail.BREVO_PORT`),
//       secure: false,
//       auth: {
//         user: configService.get<string>(`${dev_env}.mail.BREVO_USER`),
//         pass: configService.get<string>(`${dev_env}.mail.BREVO_PASS`),
//       },
//       debug: this.configService.get<boolean>('emailDebug'),
//       logger: false,
//     });

//     this.brevoApiInstance = new brevo.TransactionalEmailsApi();
//     this.brevoApiInstance.setApiKey(
//       brevo.TransactionalEmailsApiApiKeys.apiKey,
//       this.configService.get<string>(`${dev_env}.mail.BREVO_API_KEY`) || '',
//     );
//   }

//   sendMail(options: {
//     from?: string;
//     to: string;
//     subject: string;
//     text?: string;
//     html: string;
//   }) {
//     options.from = `<${this.configService.get<string>(`${process.env.NODE_ENV}.mail.BREVO_FROM`)}>`;
//     return this.nodemailerTransport.sendMail(options);
//   }
// }

// //zoho

// // var nodemailer = require('nodemailer');
// // var transport = nodemailer.createTransport({
// //     host: "smtp.zeptomail.com",
// //     port: 587,
// //     auth: {
// //     user: "emailapikey",
// //     pass: "wSsVR613/EX5C6d8mmD5ceY9mlwHVV3xFkks0Faovn6qSKjK/cdpkBHIDAb0H6BLGWVuFDQb8e8snRZUgTMJ2dx+mwoEDSiF9mqRe1U4J3x17qnvhDzJXGldkhWAJI0NzwVjnWRpEMkn+g=="
// //     }
// // });

// // var mailOptions = {
// //     from: '"Example Team" <noreply@digiplus.africa>',
// //     to: 'digiplusalliance@gmail.com',
// //     subject: 'Test Email',
// //     html: 'Test email sent successfully.',
// // };

// // transport.sendMail(mailOptions, (error, info) => {
// //     if (error) {
// //     return console.log(error);
// //     }
// //     console.log('Successfully sent');
// // });

import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ZEPTOMAIL_CONFIG, DEFAULT_FROM_EMAIL } from './mailer.constants';

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

@Injectable()
export class MailerService {
  private readonly transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailerService.name);

  constructor() {
    this.transporter = nodemailer.createTransport(ZEPTOMAIL_CONFIG);
  }

  async sendMail(options: MailOptions): Promise<void> {
    const mailOptions = {
      from: options.from || DEFAULT_FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Email sent successfully to ${options.to}. Message ID: ${info.messageId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}.`, error.stack);

      throw new Error(`ZeptoMail failed to send email to ${options.to}.`);
    }
  }
}
