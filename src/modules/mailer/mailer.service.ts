// // import { Injectable } from '@nestjs/common';
// // import { createTransport } from 'nodemailer';
// // import * as Mail from 'nodemailer/lib/mailer';
// // import { ConfigService } from '@nestjs/config';
// // import * as brevo from '@getbrevo/brevo';
// // import {
// //   TransactionalEmailsApi,
// //   SendSmtpEmail,
// //   Configuration,
// // } from '@getbrevo/brevo';

// // @Injectable()
// // export class MailerService {
// //   private nodemailerTransport: Mail;
// //   private brevoApiInstance: TransactionalEmailsApi;

// //   constructor(private readonly configService: ConfigService) {
// //     const dev_env =
// //       process.env.NODE_ENV === 'production' ? 'production' : 'development';

// //     this.nodemailerTransport = createTransport({
// //       host: configService.get<string>(`${dev_env}.mail.BREVO_HOST`),
// //       port: configService.get<number>(`${dev_env}.mail.BREVO_PORT`),
// //       secure: false,
// //       auth: {
// //         user: configService.get<string>(`${dev_env}.mail.BREVO_USER`),
// //         pass: configService.get<string>(`${dev_env}.mail.BREVO_PASS`),
// //       },
// //       debug: this.configService.get<boolean>('emailDebug'),
// //       logger: false,
// //     });

// //     this.brevoApiInstance = new brevo.TransactionalEmailsApi();
// //     this.brevoApiInstance.setApiKey(
// //       brevo.TransactionalEmailsApiApiKeys.apiKey,
// //       this.configService.get<string>(`${dev_env}.mail.BREVO_API_KEY`) || '',
// //     );
// //   }

// //   sendMail(options: {
// //     from?: string;
// //     to: string;
// //     subject: string;
// //     text?: string;
// //     html: string;
// //   }) {
// //     options.from = `<${this.configService.get<string>(`${process.env.NODE_ENV}.mail.BREVO_FROM`)}>`;
// //     return this.nodemailerTransport.sendMail(options);
// //   }
// // }

// // //zoho

// // // var nodemailer = require('nodemailer');
// // // var transport = nodemailer.createTransport({
// // //     host: "smtp.zeptomail.com",
// // //     port: 587,
// // //     auth: {
// // //     user: "emailapikey",
// // //     pass: "wSsVR613/EX5C6d8mmD5ceY9mlwHVV3xFkks0Faovn6qSKjK/cdpkBHIDAb0H6BLGWVuFDQb8e8snRZUgTMJ2dx+mwoEDSiF9mqRe1U4J3x17qnvhDzJXGldkhWAJI0NzwVjnWRpEMkn+g=="
// // //     }
// // // });

// // // var mailOptions = {
// // //     from: '"Example Team" <noreply@digiplus.africa>',
// // //     to: 'digiplusalliance@gmail.com',
// // //     subject: 'Test Email',
// // //     html: 'Test email sent successfully.',
// // // };

// // // transport.sendMail(mailOptions, (error, info) => {
// // //     if (error) {
// // //     return console.log(error);
// // //     }
// // //     console.log('Successfully sent');
// // // });

// // import { Injectable, Logger } from '@nestjs/common';
// // import * as nodemailer from 'nodemailer';
// // import { ZEPTOMAIL_CONFIG, DEFAULT_FROM_EMAIL } from './mailer.constants';

// // export interface MailOptions {
// //   to: string;
// //   subject: string;
// //   html: string;
// //   text?: string;
// //   from?: string;
// // }

// // @Injectable()
// // export class MailerService {
// //   private readonly transporter: nodemailer.Transporter;
// //   private readonly logger = new Logger(MailerService.name);

// //   constructor() {
// //     this.transporter = nodemailer.createTransport(ZEPTOMAIL_CONFIG);
// //   }

// //   async sendMail(options: MailOptions): Promise<void> {
// //     const mailOptions = {
// //       from: options.from || DEFAULT_FROM_EMAIL,
// //       to: options.to,
// //       subject: options.subject,
// //       html: options.html,
// //       text: options.text,
// //     };

// //     try {
// //       const info = await this.transporter.sendMail(mailOptions);
// //       this.logger.log(
// //         `Email sent successfully to ${options.to}. Message ID: ${info.messageId}`,
// //       );
// //     } catch (error) {
// //       this.logger.error(`Failed to send email to ${options.to}.`, error.stack);

// //       throw new Error(`ZeptoMail failed to send email to ${options.to}.`);
// //     }
// //   }
// // }

// import { Injectable, Logger } from '@nestjs/common';
// import * as nodemailer from 'nodemailer';
// import { ZEPTOMAIL_CONFIG, DEFAULT_FROM_EMAIL } from './mailer.constants';

// export interface MailOptions {
//   to: string;
//   subject: string;
//   html: string;
//   text?: string;
//   from?: string;
// }

// @Injectable()
// export class MailerService {
//   private readonly transporter: nodemailer.Transporter;
//   private readonly logger = new Logger(MailerService.name);

//   constructor() {
//     this.transporter = nodemailer.createTransport({
//       ...ZEPTOMAIL_CONFIG,
//       // Add connection timeout
//       connectionTimeout: 60000, // 60 seconds
//       greetingTimeout: 30000, // 30 seconds
//       socketTimeout: 60000, // 60 seconds
//     });

//     // Verify connection on startup
//     this.verifyConnection();
//   }

//   private async verifyConnection() {
//     try {
//       await this.transporter.verify();
//       this.logger.log('SMTP connection verified successfully');
//     } catch (error) {
//       this.logger.error('SMTP connection failed:', {
//         error: error.message,
//         host: ZEPTOMAIL_CONFIG.host,
//         port: ZEPTOMAIL_CONFIG.port,
//         user: ZEPTOMAIL_CONFIG.auth?.user,
//       });
//     }
//   }

//   async sendMail(options: MailOptions): Promise<void> {
//     const mailOptions = {
//       from: options.from || DEFAULT_FROM_EMAIL,
//       to: options.to,
//       subject: options.subject,
//       html: options.html,
//       text: options.text,
//     };

//     this.logger.log(
//       `Attempting to send email to ${options.to} with subject: ${options.subject}`,
//     );

//     try {
//       const info = await this.transporter.sendMail(mailOptions);
//       this.logger.log(
//         `Email sent successfully to ${options.to}. Message ID: ${info.messageId}`,
//       );
//     } catch (error) {
//       this.logger.error(`Failed to send email to ${options.to}`, {
//         error: error.message,
//         code: error.code,
//         command: error.command,
//         stack: error.stack,
//         mailOptions: {
//           to: options.to,
//           subject: options.subject,
//           from: mailOptions.from,
//         },
//       });

//       throw new Error(
//         `Failed to send email to ${options.to}: ${error.message}`,
//       );
//     }
//   }
// }

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
  private connectionPool: nodemailer.Transporter[] = [];
  private currentPoolIndex = 0;

  constructor() {
    // Create a connection pool to handle multiple simultaneous emails
    this.transporter = nodemailer.createTransport({
      ...ZEPTOMAIL_CONFIG,
      // Enable connection pooling
      pool: true,
      maxConnections: 3,
      maxMessages: 10,
      rateLimit: 5, // Max 5 emails per second
    });

    // Verify connection on startup
    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      this.logger.log('Testing SMTP connection...');
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
    } catch (error) {
      this.logger.error('SMTP connection failed:', {
        error: error.message,
        host: ZEPTOMAIL_CONFIG.host,
        port: ZEPTOMAIL_CONFIG.port,
        user: ZEPTOMAIL_CONFIG.auth?.user,
      });
    }
  }

  async sendMail(options: MailOptions): Promise<void> {
    const mailOptions = {
      from: options.from || DEFAULT_FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    this.logger.log(
      `Attempting to send email to ${options.to} with subject: ${options.subject}`,
    );

    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        const info = await this.transporter.sendMail(mailOptions);
        this.logger.log(
          `Email sent successfully to ${options.to}. Message ID: ${info.messageId}`,
        );
        return; // Success, exit retry loop
      } catch (error) {
        retryCount++;
        this.logger.warn(
          `Email attempt ${retryCount} failed for ${options.to}: ${error.message}`,
        );

        if (retryCount >= maxRetries) {
          this.logger.error(
            `All ${maxRetries} attempts failed for ${options.to}`,
            {
              error: error.message,
              code: error.code,
              command: error.command,
              mailOptions: {
                to: options.to,
                subject: options.subject,
                from: mailOptions.from,
              },
            },
          );

          throw new Error(
            `Failed to send email to ${options.to} after ${maxRetries} attempts: ${error.message}`,
          );
        }

        // Wait before retry (exponential backoff)
        const waitTime = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
        this.logger.log(`Retrying in ${waitTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  // Method to close all connections gracefully
  async closeConnections() {
    try {
      this.transporter.close();
      this.logger.log('Email transporter connections closed');
    } catch (error) {
      this.logger.error('Error closing email connections:', error.message);
    }
  }
}
