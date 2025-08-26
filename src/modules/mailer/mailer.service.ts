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

  async sendBulkMail(payload: {
    sender: { name?: string; email?: string };
    replyTo?: { name: string; email: string };
    messageVersions: {
      to: { email: string; name: string }[];
      subject: string;
      htmlContent: string;
      params?: Record<string, any>;
      headers?: Record<string, string>;
      textContent: string;
    }[];
    subject: string;
  }) {
    payload.sender = {
      name:
        this.configService.get<string>(
          `${process.env.NODE_ENV}.mail.BREVO_USER`,
        ) || '',
      email:
        this.configService.get<string>(
          `${process.env.NODE_ENV}.mail.BREVO_FROM`,
        ) || '',
    };
    payload.subject = 'DigiPlus Alliance: No eply';
    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.sender = payload.sender;

    if (payload.replyTo) sendSmtpEmail.replyTo = payload.replyTo;

    // Personalization
    sendSmtpEmail.messageVersions = payload.messageVersions.map((version) => ({
      to: version.to,
      headers: version.headers,
      params: version.params,
    }));

    // Default body (must exist at root)
    sendSmtpEmail.htmlContent = payload.messageVersions[0].htmlContent;
    sendSmtpEmail.textContent = payload.messageVersions[0].textContent;
    sendSmtpEmail.subject = payload.subject;

    try {
      const result =
        await this.brevoApiInstance.sendTransacEmail(sendSmtpEmail);
      return result;
    } catch (error) {
      // console.error('Brevo bulk email error:', error);
      throw error;
    }
  }
}
