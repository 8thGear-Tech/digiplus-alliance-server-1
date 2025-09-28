// ===== 4. Contact Service (contact.service.ts) =====
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact, ContactDocument } from './contact.schema';
import { ContactDto, ContactResponseDto } from './contact.dto';
import { MailerService } from 'src/modules/mailer/mailer.service';
import {
  contactFormUserEmail,
  contactFormAdminEmail,
  ADMIN_EMAIL,
} from 'src/modules/mailer/mailer.constants';

// import {
//   forgotPasswordEmail,
//   otpEmail,
//   registrationEmail,
// } from '../mailer/mailer.constants';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectModel(Contact.name)
    private contactModel: Model<ContactDocument>,
    private mailerService: MailerService,
  ) {}

  async submitContact(contactDto: ContactDto): Promise<ContactResponseDto> {
    try {
      // Save contact to database
      const contact = new this.contactModel(contactDto);
      const savedContact = await contact.save();
      this.logger.log(`Contact saved to database with ID: ${savedContact._id}`);

      // Send confirmation email to user
      try {
        await this.mailerService.sendMail({
          to: contactDto.email,
          subject: 'Thank you for contacting DigiPlus Alliance',
          html: contactFormUserEmail(savedContact),
          text: `Hello ${contactDto.first_name}, thank you for contacting us. We will get back to you soon.`,
        });
      } catch (emailError) {
        this.logger.warn(
          `Failed to send confirmation email to ${contactDto.email}`,
          emailError,
        );
      }

      // Send notification email to admin
      try {
        await this.mailerService.sendMail({
          to: ADMIN_EMAIL,
          subject: 'New Contact Form Submission - DigiPlus Alliance',
          html: contactFormAdminEmail(savedContact),
          text: `New contact from ${contactDto.first_name} ${contactDto.last_name} (${contactDto.email}): ${contactDto.message}`,
        });
      } catch (emailError) {
        this.logger.warn(`Failed to send admin notification email`, emailError);
      }

      return {
        success: true,
        message: 'Thank you for contacting us. We will get back to you soon.',
      };
    } catch (error) {
      this.logger.error('Failed to process contact form submission', error);
      throw new Error('Failed to submit contact form. Please try again later.');
    }
  }

  // Admin methods
  async getAllContacts(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const contacts = await this.contactModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.contactModel.countDocuments();

    return {
      contacts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAsRead(contactId: string): Promise<ContactDocument | null> {
    return this.contactModel.findByIdAndUpdate(
      contactId,
      { is_read: true },
      { new: true },
    );
  }

  async markAsReplied(contactId: string): Promise<ContactDocument | null> {
    return this.contactModel.findByIdAndUpdate(
      contactId,
      { is_replied: true },
      { new: true },
    );
  }
}
