import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
import { ConfigService } from '@nestjs/config';
import * as brevo from '@getbrevo/brevo';
import {
  TransactionalEmailsApi,
  SendSmtpEmail,
  Configuration,
} from '@getbrevo/brevo';

@Injectable()
export class MailerService {
  private nodemailerTransport: Mail;
  private brevoApiInstance: TransactionalEmailsApi;

  constructor(private readonly configService: ConfigService) {
    const dev_env =
      process.env.NODE_ENV === 'production' ? 'production' : 'development';

    this.nodemailerTransport = createTransport({
      host: configService.get<string>(`${dev_env}.mail.BREVO_HOST`),
      port: configService.get<number>(`${dev_env}.mail.BREVO_PORT`),
      secure: false,
      auth: {
        user: configService.get<string>(`${dev_env}.mail.BREVO_USER`),
        pass: configService.get<string>(`${dev_env}.mail.BREVO_PASS`),
      },
      debug: this.configService.get<boolean>('emailDebug'),
      logger: false,
    });

    this.brevoApiInstance = new brevo.TransactionalEmailsApi();
    this.brevoApiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      this.configService.get<string>(`${dev_env}.mail.BREVO_API_KEY`) || '',
    );
  }

  sendMail(options: {
    from?: string;
    to: string;
    subject: string;
    text?: string;
    html: string;
  }) {
    options.from = `<${this.configService.get<string>(`${process.env.NODE_ENV}.mail.BREVO_FROM`)}>`;
    return this.nodemailerTransport.sendMail(options);
  }
}
